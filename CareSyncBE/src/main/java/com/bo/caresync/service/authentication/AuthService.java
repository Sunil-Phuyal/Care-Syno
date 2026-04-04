package com.bo.caresync.service.authentication;

import com.bo.caresync.constant.AppConstants;
import com.bo.caresync.constant.MessageConstants;
import com.bo.caresync.dto.request.auth.*;
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
import com.bo.caresync.utils.LoginUserUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
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
    private final LoginUserUtil loginUserUtil;
    private final String className = this.getClass().getSimpleName();
    private final ResetLinkService resetLinkService;


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
                AppConstants.Role.PRIMARY_CAREGIVER, AppConstants.RecordStatus.ACTIVE
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
    /**
     * Update user profile
     */
    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        String methodName = "updateProfile";
        Long currentUserId = loginUserUtil.getCurrentUserId();
        log.debug("{} Updating profile for userId={}", methodName, currentUserId);
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND, "User not found"));
        user.setFullName(request.getFullName());

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isEmpty()) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getProfileImageUrl() != null && !request.getProfileImageUrl().isEmpty()) {
            user.setProfileImageUrl(request.getProfileImageUrl());
            log.debug("{} Profile image URL updated", methodName);
        }
        User updated = userRepository.save(user);
        log.info("{} Successfully updated profile for userId={}", methodName, currentUserId);
        return toUserResponse(updated);
    }

    private UserResponse toUserResponse(User user) {
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

        UserResponse response = new UserResponse();
        response.setUserId(user.getUserId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setIsEmailVerified(user.getIsEmailVerified());
        response.setRoles(roleNames);
        return response;
    }

    /**
     * Change password
     */
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        String methodName =AppUtil.getMethodName();
        Long currentUserId = loginUserUtil.getCurrentUserId();

        log.debug("{} {} Changing password for userId={}",className, methodName, currentUserId);
//        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
//            throw new BaseException(ErrorCode.INVALID_INPUT, "New passwords do not match");
//        }
        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new BaseException(ErrorCode.INVALID_INPUT, "New password must be different from current password");
        }
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND, "User not found"));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BaseException(ErrorCode.INVALID_CREDENTIALS, "Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        try {
            emailService.sendSimpleEmail(
                    user.getEmail(),
                    "Password Changed - CareSync",
                    emailTemplateService.getPasswordChangedBody(user.getFullName())
            );
        } catch (Exception e) {
            log.warn("{} Failed to send password change email: {}", methodName, e.getMessage());
        }
        log.info("{} Successfully changed password for userId={}", methodName, currentUserId);
    }

    /**
     * Forgot Password - Step 1
     * Accepts email, generates secure reset link, sends email
     */
    @Transactional
    public void forgotPassword(String email) {
        String methodName = AppUtil.getMethodName();
        log.debug("{} {} Forgot password request for email={}", className, methodName, email);

        // Always respond with success even if email not found (security best practice)
        // So attacker can't enumerate valid emails
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            log.warn("{} {} Forgot password - email not found: {}", className, methodName, email);
            return; // silent return, don't expose that email doesn't exist
        }

        // Only allow ACTIVE users to reset password
        if (!AppConstants.RecordStatus.ACTIVE.equals(user.getRecordStatus())) {
            log.warn("{} {} Forgot password - user not active: {}", className, methodName, email);
            return;
        }

        try {
            String resetLink = resetLinkService.generateLink(user.getUserId(), "FORGOT_PASSWORD");

            emailService.sendSimpleEmail(
                    user.getEmail(),
                    "Reset Your Password - CareSync",
                    emailTemplateService.getForgotPasswordEmailBody(
                            user.getFullName(),
                            resetLink,
                            resetLinkService.getResetLinkExpiration()
                    )
            );

            log.info("{} {} Reset link sent to userId={}", className, methodName, user.getUserId());

        } catch (Exception e) {
            log.error("{} {} Failed to send reset link for email={}: {}",
                    className, methodName, email, e.getMessage());
            // Don't expose error to caller
        }
    }

    /**
     * Forgot Password - Step 2
     * Validates token, sets new password
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String methodName = AppUtil.getMethodName();
        log.debug("{} {} Reset password attempt", className, methodName);

        // Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BaseException(ErrorCode.VALIDATION_ERROR, "Passwords do not match");
        }

        // Validate and decrypt token
        Map<String, String> payload;
        try {
            payload = resetLinkService.validateAndDecrypt(request.getToken());
        } catch (Exception e) {
            throw new BaseException(ErrorCode.INVALID_TOKEN, e.getMessage());
        }

        // Make sure this is a forgot-password token, not an invite token
        String linkType = payload.get("linkType");
        if (!"FORGOT_PASSWORD".equals(linkType)) {
            throw new BaseException(ErrorCode.INVALID_TOKEN, "Invalid reset link");
        }

        Long userId = Long.parseLong(payload.get("userId"));
        String tokenId = payload.get("tokenId");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        // Must be active user
        if (!AppConstants.RecordStatus.ACTIVE.equals(user.getRecordStatus())) {
            throw new BaseException(ErrorCode.VALIDATION_ERROR, "Account is not active");
        }

        // New password must be different from current
        if (passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BaseException(ErrorCode.INVALID_INPUT,
                    "New password must be different from your current password");
        }

        // Set new password
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        // Mark token as used — can't reuse the link
        resetLinkService.markTokenAsUsed(tokenId);

        // Send confirmation email
        try {
            emailService.sendSimpleEmail(
                    user.getEmail(),
                    "Password Reset Successful - CareSync",
                    emailTemplateService.getPasswordChangedBody(user.getFullName())
            );
        } catch (Exception e) {
            log.warn("{} {} Failed to send password reset confirmation email: {}",
                    className, methodName, e.getMessage());
        }

        log.info("{} {} Password reset successfully for userId={}", className, methodName, userId);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Long userId) {
        String methodName = AppUtil.getMethodName();

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
