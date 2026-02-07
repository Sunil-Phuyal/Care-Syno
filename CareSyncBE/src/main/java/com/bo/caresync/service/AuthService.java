package com.bo.caresync.service;

import com.bo.caresync.constant.AppConstants;
import com.bo.caresync.constant.MessageConstants;
import com.bo.caresync.dto.request.auth.RegisterRequest;
import com.bo.caresync.dto.request.auth.LoginRequest;
import com.bo.caresync.dto.response.auth.LoginResponse;
import com.bo.caresync.dto.response.auth.UserResponse;
import com.bo.caresync.entity.auth.Role;
import com.bo.caresync.entity.user.User;
import com.bo.caresync.entity.user.UserRole;
import com.bo.caresync.enums.ErrorCode;
import com.bo.caresync.exceptions.BaseException;
import com.bo.caresync.repository.RoleRepository;
import com.bo.caresync.repository.UserRepository;
import com.bo.caresync.repository.UserRoleRepository;
import com.bo.caresync.service.email.EmailService;
import com.bo.caresync.service.email.EmailTemplateService;
import com.bo.caresync.utils.AppUtil;
import com.bo.caresync.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/4/2026, 3:42 PM,
 **/
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;
    private final String className = this.getClass().getSimpleName();


    @Transactional
    public void register(RegisterRequest request) {
        String methodName = AppUtil.getMethodName();

        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("{} Registration failed - email exists: {}", methodName, request.getEmail());
            throw new BaseException(ErrorCode.EMAIL_ALREADY_EXISTS,
                    MessageConstants.Auth.EMAIL_ALREADY_EXISTS);
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setIsEmailVerified(false);
        user.setRecordStatus(AppConstants.RecordStatus.ACTIVE);
        user.setCreatedBy(AppConstants.Auditor.SYSTEM_USER);

        User savedUser = userRepository.save(user);

        Role primaryRole = roleRepository.findByRoleNameAndRecordStatus(
                AppConstants.Role.PRIMARY_CAREGIVER,
                AppConstants.RecordStatus.ACTIVE
        ).orElseThrow(() -> new BaseException(ErrorCode.ROLE_NOT_FOUND));

        UserRole userRole = new UserRole();
        userRole.setUserId(savedUser.getUserId());
        userRole.setRoleId(primaryRole.getRoleId());
        userRole.setRecordStatus(AppConstants.RecordStatus.ACTIVE);
        userRole.setCreatedBy(AppConstants.Auditor.SYSTEM_USER);

        userRoleRepository.save(userRole);

        log.info("{} User registered successfully: {}", methodName, savedUser.getEmail());

        // Send welcome email
        String emailBody = emailTemplateService.getWelcomeEmailBody(
                savedUser.getFullName(),
                savedUser.getEmail()
        );
        emailService.sendSimpleEmail(
                savedUser.getEmail(),
                "Welcome to CareSync!",
                emailBody
        );
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String methodName = AppUtil.getMethodName();

        User user = userRepository.findByEmailAndRecordStatus(
                request.getEmail(),
                AppConstants.RecordStatus.ACTIVE
        ).orElseThrow(() -> {
            log.warn("{} Login failed - user not found: {}", methodName, request.getEmail());
            return new BaseException(ErrorCode.INVALID_CREDENTIALS,
                    MessageConstants.Auth.INVALID_CREDENTIALS);
        });

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            log.warn("{} Login failed - invalid password: {}", methodName, request.getEmail());
            throw new BaseException(ErrorCode.INVALID_CREDENTIALS,
                    MessageConstants.Auth.INVALID_CREDENTIALS);
        }

        List<UserRole> userRoles = userRoleRepository.findByUserIdAndRecordStatus(
                user.getUserId(),
                AppConstants.RecordStatus.ACTIVE
        );

        List<String> roleNames = userRoles.stream()
                .map(ur -> {
                    Role role = roleRepository.findById(ur.getRoleId())
                            .orElseThrow(() -> new BaseException(ErrorCode.ROLE_NOT_FOUND));
                    return role.getRoleName();
                })
                .collect(Collectors.toList());

        String token = jwtUtil.generateAccessToken(user.getUserId(), user.getEmail(), roleNames);

        log.info("{} User logged in successfully: {}", methodName, user.getEmail());

        return new LoginResponse(
                token,
                user.getUserId(),
                user.getEmail(),
                user.getFullName(),
                roleNames
        );
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Long userId) {
        String methodName = "getCurrentUser";

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        List<UserRole> userRoles = userRoleRepository.findByUserIdAndRecordStatus(
                userId,
                AppConstants.RecordStatus.ACTIVE
        );

        List<String> roleNames = userRoles.stream()
                .map(ur -> {
                    Role role = roleRepository.findById(ur.getRoleId())
                            .orElseThrow(() -> new BaseException(ErrorCode.ROLE_NOT_FOUND));
                    return role.getRoleName();
                })
                .collect(Collectors.toList());

        UserResponse response = new UserResponse();
        response.setUserId(user.getUserId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setIsEmailVerified(user.getIsEmailVerified());
        response.setRoles(roleNames);
        return response;
    }

}
