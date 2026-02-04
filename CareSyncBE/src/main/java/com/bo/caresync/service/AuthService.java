package com.bo.caresync.service;

import com.bo.caresync.constant.AppConstants;
import com.bo.caresync.constant.MessageConstants;
import com.bo.caresync.dto.request.RegisterRequest;
import com.bo.caresync.entity.auth.Role;
import com.bo.caresync.entity.user.User;
import com.bo.caresync.entity.user.UserRole;
import com.bo.caresync.enums.ErrorCode;
import com.bo.caresync.exceptions.BaseException;
import com.bo.caresync.repository.RoleRepository;
import com.bo.caresync.repository.UserRepository;
import com.bo.caresync.repository.UserRoleRepository;
import com.bo.caresync.utils.AppUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
    private final String className = this.getClass().getSimpleName();


    public void register(RegisterRequest request) {
        String methodName = AppUtil.getMethodName();
        // Check if email already exists
        if(userRepository.existsByEmail(request.getEmail())) {
            log.warn("{} {} Registration failed - email exists: {}",className, methodName, request.getEmail());
            throw new BaseException(ErrorCode.EMAIL_ALREADY_EXISTS,
                    MessageConstants.Auth.EMAIL_ALREADY_EXISTS);
        }
        // Create user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setIsEmailVerified(false);
        user.setRecordStatus(AppConstants.RecordStatus.ACTIVE);
        user.setCreatedBy(AppConstants.Auditor.SYSTEM_USER);
        User savedUser = userRepository.save(user);

        // Assign PRIMARY_CAREGIVER role by default
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
        log.info("{} {} User registered successfully: {}",className, methodName, savedUser.getEmail());
    }



}
