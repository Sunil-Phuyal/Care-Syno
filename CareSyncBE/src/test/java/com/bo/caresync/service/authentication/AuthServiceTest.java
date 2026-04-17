package com.bo.caresync.service.authentication;

import com.bo.caresync.constant.AppConstants;
import com.bo.caresync.dto.request.auth.RegisterRequest;
import com.bo.caresync.dto.request.auth.LoginRequest;
import com.bo.caresync.dto.request.auth.ChangePasswordRequest;
import com.bo.caresync.dto.request.auth.UpdateProfileRequest;
import com.bo.caresync.dto.request.auth.ResetPasswordRequest;
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
import com.bo.caresync.utils.JwtUtil;
import com.bo.caresync.utils.LoginUserUtil;
import com.bo.caresync.utils.AppUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 4/13/2026, 9:42 AM,
 **/
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private RoleRepository roleRepository;
    @Mock private UserRoleRepository userRoleRepository;
    @Mock private JwtUtil jwtUtil;
    @Mock private EmailService emailService;
    @Mock private EmailTemplateService emailTemplateService;
    @Mock private LoginUserUtil loginUserUtil;
    @Mock private ResetLinkService resetLinkService;

    @InjectMocks
    private AuthService authService;

    // ===== Helper: Create dummy User =====
    private User createUser() {
        User user = new User();
        user.setUserId(1L);
        user.setEmail("test@gmail.com");
        user.setPasswordHash("hashedPassword");
        user.setFullName("Test User");
        user.setPhoneNumber("9800000000");
        user.setIsEmailVerified(false);
        user.setRecordStatus(AppConstants.RecordStatus.ACTIVE);
        return user;
    }

    // ===== Helper: Create dummy Role =====
    private Role createRole() {
        Role role = new Role();
        role.setRoleId(1L);
        role.setRoleName(AppConstants.Role.PRIMARY_CAREGIVER);
        return role;
    }

    // ===== Helper: Create dummy UserRole =====
    private UserRole createUserRole() {
        UserRole userRole = new UserRole();
        userRole.setUserId(1L);
        userRole.setRoleId(1L);
        userRole.setRecordStatus(AppConstants.RecordStatus.ACTIVE);
        return userRole;
    }


    // ===================== REGISTER TESTS =====================

    @Test
    void register_ShouldSuccess_WhenEmailNotExists() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@gmail.com");
        request.setPassword("password123");
        request.setFullName("Test User");
        request.setPhoneNumber("9800000000");

        Role role = createRole();
        User savedUser = createUser();

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(roleRepository.findByRoleNameAndRecordStatus(
                AppConstants.Role.PRIMARY_CAREGIVER,
                AppConstants.RecordStatus.ACTIVE
        )).thenReturn(Optional.of(role));
        when(passwordEncoder.encode(request.getPassword())).thenReturn("hashedPassword");
        when(emailTemplateService.getWelcomeEmailBody(any(), any())).thenReturn("Welcome Email Body");
        authService.register(request);
        verify(userRepository).save(any(User.class));
        verify(userRoleRepository).save(any(UserRole.class));
        verify(emailService).sendSimpleEmail(
                eq("test@gmail.com"),
                eq("Welcome to CareSync!"),
                any()
        );
    }

    @Test
    void register_ShouldThrowException_WhenEmailAlreadyExists() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@gmail.com");
        request.setPassword("password123");
        request.setFullName("Test User");
        request.setPhoneNumber("9800000000");
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);
        assertThrows(BaseException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    // ===================== LOGIN TESTS =====================

    @Test
    void login_ShouldSuccess_WhenValidCredentials() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@gmail.com");
        request.setPassword("password123");

        User user = createUser();
        Role role = createRole();
        UserRole userRole = createUserRole();

        when(userRepository.findByEmailAndRecordStatus(
                request.getEmail(),
                AppConstants.RecordStatus.ACTIVE
        )).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPasswordHash())).thenReturn(true);
        when(userRoleRepository.findByUserIdAndRecordStatus(
                user.getUserId(),
                AppConstants.RecordStatus.ACTIVE
        )).thenReturn(List.of(userRole));
        when(roleRepository.findById(userRole.getRoleId())).thenReturn(Optional.of(role));
        when(jwtUtil.generateAccessToken(
                user.getUserId(),
                user.getEmail(),
                List.of(role.getRoleName())
        )).thenReturn("mock-jwt-token");
        LoginResponse response = authService.login(request);
        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getToken());
        assertEquals("test@gmail.com", response.getEmail());
    }

    @Test
    void login_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("notfound@gmail.com");
        request.setPassword("password123");

        when(userRepository.findByEmailAndRecordStatus(
                request.getEmail(),
                AppConstants.RecordStatus.ACTIVE
        )).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(BaseException.class, () -> authService.login(request));
    }

    @Test
    void login_ShouldThrowException_WhenPasswordIsWrong() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("test@gmail.com");
        request.setPassword("wrongpassword");

        User user = createUser();

        when(userRepository.findByEmailAndRecordStatus(
                request.getEmail(),
                AppConstants.RecordStatus.ACTIVE
        )).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPasswordHash())).thenReturn(false);

        assertThrows(BaseException.class, () -> authService.login(request));
    }

    // ===================== UPDATE PROFILE TESTS =====================

    @Test
    void updateProfile_ShouldSuccess_WhenValidRequest() {
        // Arrange
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("Updated Name");
        request.setPhoneNumber("9811111111");
        request.setProfileImageUrl("http://image.url/photo.jpg");

        User user = createUser();
        UserRole userRole = createUserRole();
        Role role = createRole();

        when(loginUserUtil.getCurrentUserId()).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(userRoleRepository.findByUserIdAndRecordStatus(
                1L, AppConstants.RecordStatus.ACTIVE
        )).thenReturn(List.of(userRole));
        when(roleRepository.findById(1L)).thenReturn(Optional.of(role));

        // Act
        UserResponse response = authService.updateProfile(request);

        // Assert
        assertNotNull(response);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void updateProfile_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("Updated Name");

        when(loginUserUtil.getCurrentUserId()).thenReturn(99999L);
        when(userRepository.findById(99999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(BaseException.class, () -> authService.updateProfile(request));
    }

// ===================== CHANGE PASSWORD TESTS =====================

    @Test
    void changePassword_ShouldSuccess_WhenValidRequest() {
        // Arrange
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("oldPassword");
        request.setNewPassword("newPassword123");

        User user = createUser();

        when(loginUserUtil.getCurrentUserId()).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("oldPassword", user.getPasswordHash())).thenReturn(true);
        when(passwordEncoder.encode("newPassword123")).thenReturn("newHashedPassword");
        when(emailTemplateService.getPasswordChangedBody(any())).thenReturn("Password Changed Body");

        // Act
        authService.changePassword(request);

        // Assert
        verify(userRepository).save(any(User.class));
    }

    @Test
    void changePassword_ShouldThrowException_WhenSameAsCurrentPassword() {
        // Arrange
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("samePassword");
        request.setNewPassword("samePassword");

        when(loginUserUtil.getCurrentUserId()).thenReturn(1L);

        // Act & Assert
        assertThrows(BaseException.class, () -> authService.changePassword(request));
    }

    @Test
    void changePassword_ShouldThrowException_WhenCurrentPasswordIsWrong() {
        // Arrange
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("wrongPassword");
        request.setNewPassword("newPassword123");

        User user = createUser();

        when(loginUserUtil.getCurrentUserId()).thenReturn(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", user.getPasswordHash())).thenReturn(false);

        // Act & Assert
        assertThrows(BaseException.class, () -> authService.changePassword(request));
    }

    @Test
    void changePassword_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("oldPassword");
        request.setNewPassword("newPassword123");

        when(loginUserUtil.getCurrentUserId()).thenReturn(99L);
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(BaseException.class, () -> authService.changePassword(request));
    }

    @Test
    void forgotPassword_ShouldSendResetLink_WhenUserExists() throws Exception {
        // Arrange
        User user = createUser();

        when(userRepository.findByEmail("test@gmail.com")).thenReturn(Optional.of(user));
        when(resetLinkService.generateLink(anyLong(), eq("FORGOT_PASSWORD")))
                .thenReturn("http://reset.link/token");
        when(resetLinkService.getResetLinkExpiration()).thenReturn(30L);
        when(emailTemplateService.getForgotPasswordEmailBody(anyString(), anyString(), anyLong()))
                .thenReturn("Reset Email Body");

        // Act
        authService.forgotPassword("test@gmail.com");

        // Assert
        verify(emailService).sendSimpleEmail(
                eq("test@gmail.com"),
                eq("Reset Your Password - CareSync"),
                anyString()
        );
    }

    @Test
    void forgotPassword_ShouldReturnSilently_WhenEmailNotFound() {
        // Arrange
        when(userRepository.findByEmail("notfound@gmail.com")).thenReturn(Optional.empty());

        // Act
        authService.forgotPassword("notfound@gmail.com");

        // Assert - email should never be sent
        verify(emailService, never()).sendSimpleEmail(any(), any(), any());
    }

    @Test
    void forgotPassword_ShouldReturnSilently_WhenUserNotActive() {
        User user = createUser();
        user.setRecordStatus("INACTIVE");

        when(userRepository.findByEmail("test@gmail.com")).thenReturn(Optional.of(user));
        authService.forgotPassword("test@gmail.com");
        verify(emailService, never()).sendSimpleEmail(any(), any(), any());
    }

// ===================== RESET PASSWORD TESTS =====================

    @Test
    void resetPassword_ShouldSuccess_WhenValidRequest() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token");
        request.setPassword("newPassword123");
        request.setConfirmPassword("newPassword123");

        User user = createUser();

        Map<String, String> payload = Map.of(
                "linkType", "FORGOT_PASSWORD",
                "userId", "1",
                "tokenId", "token-123"
        );

        when(resetLinkService.validateAndDecrypt("valid-token")).thenReturn(payload);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("newPassword123", user.getPasswordHash())).thenReturn(false);
        when(passwordEncoder.encode("newPassword123")).thenReturn("newHashedPassword");
        when(emailTemplateService.getPasswordChangedBody(any())).thenReturn("Password Reset Body");
        authService.resetPassword(request);
        verify(userRepository).save(any(User.class));
        verify(resetLinkService).markTokenAsUsed("token-123");
    }

    @Test
    void resetPassword_ShouldThrowException_WhenPasswordsDoNotMatch() {
        // Arrange
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token");
        request.setPassword("newPassword123");
        request.setConfirmPassword("differentPassword");

        // Act & Assert
        assertThrows(BaseException.class, () -> authService.resetPassword(request));
    }

    @Test
    void resetPassword_ShouldThrowException_WhenTokenIsInvalid() throws Exception {
        // Arrange
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("invalid-token");
        request.setPassword("newPassword123");
        request.setConfirmPassword("newPassword123");

        when(resetLinkService.validateAndDecrypt("invalid-token"))
                .thenThrow(new RuntimeException("Invalid token"));

        // Act & Assert
        assertThrows(BaseException.class, () -> authService.resetPassword(request));
    }

    @Test
    void resetPassword_ShouldThrowException_WhenWrongLinkType() throws Exception {
        // Arrange
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token");
        request.setPassword("newPassword123");
        request.setConfirmPassword("newPassword123");

        Map<String, String> payload = Map.of(
                "linkType", "INVITE",
                "userId", "1",
                "tokenId", "token-123"
        );

        when(resetLinkService.validateAndDecrypt("valid-token")).thenReturn(payload);

        // Act & Assert
        assertThrows(BaseException.class, () -> authService.resetPassword(request));
    }

    @Test
    void resetPassword_ShouldThrowException_WhenSameAsCurrentPassword() throws Exception {
        // Arrange
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token");
        request.setPassword("samePassword");
        request.setConfirmPassword("samePassword");

        User user = createUser();

        Map<String, String> payload = Map.of(
                "linkType", "FORGOT_PASSWORD",
                "userId", "1",
                "tokenId", "token-123"
        );

        when(resetLinkService.validateAndDecrypt("valid-token")).thenReturn(payload);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("samePassword", user.getPasswordHash())).thenReturn(true);

        // Act & Assert
        assertThrows(BaseException.class, () -> authService.resetPassword(request));
    }

    @Test
    void resetPassword_ShouldThrowException_WhenUserNotActive() throws Exception {
        // Arrange
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token");
        request.setPassword("newPassword123");
        request.setConfirmPassword("newPassword123");

        User user = createUser();
        user.setRecordStatus("INACTIVE");

        Map<String, String> payload = Map.of(
                "linkType", "FORGOT_PASSWORD",
                "userId", "1",
                "tokenId", "token-123"
        );

        when(resetLinkService.validateAndDecrypt("valid-token")).thenReturn(payload);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        // Act & Assert
        assertThrows(BaseException.class, () -> authService.resetPassword(request));
    }

// ===================== GET CURRENT USER TESTS =====================

    @Test
    void getCurrentUser_ShouldReturnUser_WhenUserExists() {
        // Arrange
        User user = createUser();
        UserRole userRole = createUserRole();
        Role role = createRole();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRoleRepository.findByUserIdAndRecordStatus(
                1L, AppConstants.RecordStatus.ACTIVE
        )).thenReturn(List.of(userRole));
        when(roleRepository.findById(1L)).thenReturn(Optional.of(role));

        // Act
        UserResponse response = authService.getCurrentUser(1L);

        // Assert
        assertNotNull(response);
        assertEquals("test@gmail.com", response.getEmail());
        assertEquals("Test User", response.getFullName());
    }

    @Test
    void getCurrentUser_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(BaseException.class, () -> authService.getCurrentUser(99L));
    }
}