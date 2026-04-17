package com.bo.caresync.service.authentication.caregiver;

import com.bo.caresync.constant.AppConstants;
import com.bo.caresync.constant.MessageConstants;
import com.bo.caresync.dto.request.auth.AcceptInviteRequest;
import com.bo.caresync.dto.request.caregiver.GrantPermissionRequest;
import com.bo.caresync.dto.request.caregiver.InviteCaregiverRequest;
import com.bo.caresync.dto.request.caregiver.UpdateCaregiverRoleRequest;
import com.bo.caresync.dto.response.caregiver.CaregiverResponse;
import com.bo.caresync.entity.auth.Permission;
import com.bo.caresync.entity.auth.Role;
import com.bo.caresync.entity.patient.PatientCaregiver;
import com.bo.caresync.entity.patient.PatientCaregiverPermission;
import com.bo.caresync.entity.user.User;
import com.bo.caresync.entity.user.UserRole;
import com.bo.caresync.exceptions.BaseException;
import com.bo.caresync.repository.*;
import com.bo.caresync.service.authentication.ResetLinkService;
import com.bo.caresync.service.caregiver.CaregiverService;
import com.bo.caresync.service.email.EmailService;
import com.bo.caresync.service.email.EmailTemplateService;
import com.bo.caresync.utils.LoginUserUtil;
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
 * @since 4/15/2026, 8:54 AM,
 **/
@ExtendWith(MockitoExtension.class)
class CaregiverServiceTest {

    @Mock private UserRepository userRepo;
    @Mock private UserRoleRepository userRoleRepo;
    @Mock private RoleRepository roleRepo;
    @Mock private PatientCaregiverRepository caregiverRepo;
    @Mock private PatientCaregiverPermissionRepository permissionRepo;
    @Mock private PermissionRepository permissionRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private LoginUserUtil loginUserUtil;
    @Mock private PatientRepository patientRepo;
    @Mock private EmailService emailService;
    @Mock private EmailTemplateService emailTemplateService;
    @Mock private ResetLinkService resetLinkService;

    @InjectMocks
    private CaregiverService caregiverService;

    // ===== Helper: Create dummy User =====
    private User createUser() {
        User user = new User();
        user.setUserId(1L);
        user.setEmail("sita.rana@gmail.com");
        user.setFullName("Sita Rana");
        user.setPhoneNumber("9801234567");
        user.setRecordStatus(AppConstants.RecordStatus.ACTIVE);
        return user;
    }

    // ===== Helper: Create dummy Caregiver User =====
    private User createCaregiverUser() {
        User user = new User();
        user.setUserId(2L);
        user.setEmail("ram.bahadur@gmail.com");
        user.setFullName("Ram Bahadur Thapa");
        user.setPhoneNumber("9812345678");
        user.setRecordStatus(AppConstants.RecordStatus.ACTIVE);
        return user;
    }

    // ===== Helper: Create dummy Role =====
    private Role createRole() {
        Role role = new Role();
        role.setRoleId(2L);
        role.setRoleName("SECONDARY_CAREGIVER");
        role.setDisplayName("Secondary Caregiver");
        return role;
    }

    // ===== Helper: Create dummy PatientCaregiver =====
    private PatientCaregiver createPatientCaregiver() {
        PatientCaregiver pc = new PatientCaregiver();
        pc.setPatientId(1L);
        pc.setCaregiverUserId(2L);
        pc.setRoleId(2L);
        pc.setRelationship("Son");
        pc.setRecordStatus(AppConstants.RecordStatus.ACTIVE);
        return pc;
    }

    // ===== Helper: Create dummy Permission =====
    private Permission createPermission() {
        Permission permission = new Permission();
        permission.setPermissionId(1L);
        permission.setPermissionCode("medication.view");
        permission.setPermissionName("View Medication");
        return permission;
    }

    // ===================== GET PATIENT CAREGIVERS TESTS =====================

    @Test
    void getPatientCaregivers_ShouldReturnCaregivers_WhenCaregiversExist() {
        PatientCaregiver pc = createPatientCaregiver();
        User caregiverUser = createCaregiverUser();
        Role role = createRole();

        doNothing().when(loginUserUtil).requirePermission(1L, "caregiver.view");
        when(caregiverRepo.findByPatientIdAndRecordStatus(
                1L, AppConstants.RecordStatus.ACTIVE
        )).thenReturn(List.of(pc));
        when(userRepo.findById(2L)).thenReturn(Optional.of(caregiverUser));
        when(roleRepo.findById(2L)).thenReturn(Optional.of(role));
        List<CaregiverResponse> responses = caregiverService.getPatientCaregivers(1L);
        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals("Ram Bahadur Thapa", responses.get(0).getFullName());
    }

    // ===================== INVITE CAREGIVER TESTS =====================

    @Test
    void inviteCaregiver_ShouldSuccess_WhenNewUserInvited() throws Exception {
        InviteCaregiverRequest request = new InviteCaregiverRequest();
        request.setPatientId(1L);
        request.setEmail("nirmala.gurung@gmail.com");
        request.setFullName("Nirmala Gurung");
        request.setRoleId(2L);
        request.setRelationship("Daughter");

        User newCaregiver = new User();
        newCaregiver.setUserId(3L);
        newCaregiver.setEmail("nirmala.gurung@gmail.com");
        newCaregiver.setFullName("Nirmala Gurung");
        newCaregiver.setRecordStatus(AppConstants.RecordStatus.PENDING);
        User currentUser = createUser();
        doNothing().when(loginUserUtil).requirePermission(1L, "caregiver.invite");
        when(userRepo.findByEmail("nirmala.gurung@gmail.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("hashedPassword");
        when(userRepo.save(any(User.class))).thenReturn(newCaregiver);
        when(userRoleRepo.save(any(UserRole.class))).thenReturn(new UserRole());
        when(caregiverRepo.findByPatientIdAndCaregiverUserIdAndRecordStatus(
                eq(1L), eq(3L), eq(AppConstants.RecordStatus.ACTIVE)
        )).thenReturn(Optional.empty());
        when(caregiverRepo.save(any(PatientCaregiver.class))).thenReturn(new PatientCaregiver());
        when(loginUserUtil.getCurrentUser()).thenReturn(currentUser);
        when(resetLinkService.generateLink(eq(3L), eq("INVITE")))
                .thenReturn("http://caresync.com/invite/token123");
        when(emailTemplateService.getCaregiverInvitationBody(any(), any(), any(), any()))
                .thenReturn("Invitation Email Body");

        // Act
        caregiverService.inviteCaregiver(request);

        // Assert
        verify(userRepo).save(any(User.class));
        verify(caregiverRepo).save(any(PatientCaregiver.class));
        verify(emailService).sendSimpleEmail(
                eq("nirmala.gurung@gmail.com"),
                any(),
                any()
        );
    }

    @Test
    void inviteCaregiver_ShouldSuccess_WhenExistingUserInvited() {
        // Arrange
        InviteCaregiverRequest request = new InviteCaregiverRequest();
        request.setPatientId(1L);
        request.setEmail("ram.bahadur@gmail.com");
        request.setFullName("Ram Bahadur Thapa");
        request.setRoleId(2L);
        request.setRelationship("Son");

        User existingCaregiver = createCaregiverUser();
        User currentUser = createUser();

        doNothing().when(loginUserUtil).requirePermission(1L, "caregiver.invite");
        when(userRepo.findByEmail("ram.bahadur@gmail.com"))
                .thenReturn(Optional.of(existingCaregiver));
        when(caregiverRepo.findByPatientIdAndCaregiverUserIdAndRecordStatus(
                eq(1L), eq(2L), eq(AppConstants.RecordStatus.ACTIVE)
        )).thenReturn(Optional.empty());
        when(caregiverRepo.save(any(PatientCaregiver.class))).thenReturn(new PatientCaregiver());
        when(loginUserUtil.getCurrentUser()).thenReturn(currentUser);
        when(emailTemplateService.getCaregiverAddedBody(any(), any(), any()))
                .thenReturn("Caregiver Added Email Body");
        caregiverService.inviteCaregiver(request);
        verify(caregiverRepo).save(any(PatientCaregiver.class));
        verify(emailService).sendSimpleEmail(
                eq("ram.bahadur@gmail.com"),
                any(),
                any()
        );
    }

    // ===================== REMOVE CAREGIVER TESTS =====================

    @Test
    void removeCaregiver_ShouldSuccess_WhenCaregiverExists() {
        PatientCaregiver pc = createPatientCaregiver();

        doNothing().when(loginUserUtil).requirePermission(
                1L, AppConstants.Permission.CAREGIVER_REMOVE
        );
        when(loginUserUtil.getCurrentUserId()).thenReturn(1L);
        when(caregiverRepo.findByPatientIdAndCaregiverUserIdAndRecordStatus(
                1L, 2L, AppConstants.RecordStatus.ACTIVE
        )).thenReturn(Optional.of(pc));
        when(caregiverRepo.save(any(PatientCaregiver.class))).thenReturn(pc);
        caregiverService.removeCaregiver(1L, 2L);
        verify(caregiverRepo).save(any(PatientCaregiver.class));
        assertEquals(AppConstants.RecordStatus.INACTIVE, pc.getRecordStatus());
    }

    // ===================== UPDATE CAREGIVER ROLE TESTS =====================

    @Test
    void updateCaregiverRole_ShouldSuccess_WhenValidRequest() {
        UpdateCaregiverRoleRequest request = new UpdateCaregiverRoleRequest();
        request.setPatientId(1L);
        request.setCaregiverUserId(2L);
        request.setNewRoleId(3L);
        PatientCaregiver pc = createPatientCaregiver();
        User caregiverUser = createCaregiverUser();
        Role role = createRole();
        role.setRoleId(3L);
        role.setRoleName("VIEWER");
        role.setDisplayName("Viewer");

        doNothing().when(loginUserUtil).requirePermission(
                1L, AppConstants.Permission.CAREGIVER_EDIT_PERMISSIONS
        );
        when(caregiverRepo.findByPatientIdAndCaregiverUserIdAndRecordStatus(
                1L, 2L, AppConstants.RecordStatus.ACTIVE
        )).thenReturn(Optional.of(pc));
        when(caregiverRepo.save(any(PatientCaregiver.class))).thenReturn(pc);
        when(userRepo.findById(2L)).thenReturn(Optional.of(caregiverUser));
        when(roleRepo.findById(3L)).thenReturn(Optional.of(role));

        CaregiverResponse response = caregiverService.updateCaregiverRole(request);
        assertNotNull(response);
        verify(caregiverRepo).save(any(PatientCaregiver.class));
    }

    // ===================== GRANT PERMISSION TESTS =====================

    @Test
    void grantPermission_ShouldSuccess_WhenValidRequest() {
        GrantPermissionRequest request = new GrantPermissionRequest();
        request.setPatientId(1L);
        request.setCaregiverUserId(2L);
        request.setPermissionCode("medication.view");
        request.setIsGranted(true);
        request.setNotes("Granted for medication tracking");

        Permission permission = createPermission();

        doNothing().when(loginUserUtil).requirePermission(
                1L, AppConstants.Permission.CAREGIVER_EDIT_PERMISSIONS
        );
        when(loginUserUtil.getCurrentUserId()).thenReturn(1L);
        when(permissionRepository.findByPermissionCode("medication.view"))
                .thenReturn(Optional.of(permission));
        when(permissionRepo.findByPatientIdAndCaregiverUserIdAndPermissionIdAndRecordStatus(
                1L, 2L, 1L, AppConstants.RecordStatus.ACTIVE
        )).thenReturn(Optional.empty());
        when(permissionRepo.save(any(PatientCaregiverPermission.class)))
                .thenReturn(new PatientCaregiverPermission());
        caregiverService.grantPermission(request);
        verify(permissionRepo).save(any(PatientCaregiverPermission.class));
    }

    // ===================== ACCEPT INVITE TESTS =====================

    @Test
    void acceptInvite_ShouldSuccess_WhenValidToken() throws Exception {
        AcceptInviteRequest request = new AcceptInviteRequest();
        request.setToken("valid-invite-token");
        request.setPassword("Nirmala@1234");
        request.setConfirmPassword("Nirmala@1234");
        request.setPhoneNumber("9823456789");

        User user = new User();
        user.setUserId(3L);
        user.setEmail("nirmala.gurung@gmail.com");
        user.setRecordStatus(AppConstants.RecordStatus.PENDING);

        Map<String, String> payload = Map.of(
                "linkType", "INVITE",
                "userId", "3",
                "tokenId", "token-abc-123"
        );

        when(resetLinkService.validateAndDecrypt("valid-invite-token")).thenReturn(payload);
        when(userRepo.findById(3L)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("Nirmala@1234")).thenReturn("hashedPassword");
        when(userRepo.save(any(User.class))).thenReturn(user);
        caregiverService.acceptInvite(request);

        verify(userRepo).save(any(User.class));
        assertEquals(AppConstants.RecordStatus.ACTIVE, user.getRecordStatus());
        assertTrue(user.getIsEmailVerified());
    }
}
