package com.bo.caresync.service.caregiver;

import com.bo.caresync.constant.AppConstants;
import com.bo.caresync.constant.MessageConstants;
import com.bo.caresync.dto.request.auth.AcceptInviteRequest;
import com.bo.caresync.dto.request.caregiver.GrantPermissionRequest;
import com.bo.caresync.dto.request.caregiver.InviteCaregiverRequest;
import com.bo.caresync.dto.request.caregiver.UpdateCaregiverRoleRequest;
import com.bo.caresync.dto.response.caregiver.CaregiverResponse;
import com.bo.caresync.entity.auth.Permission;
import com.bo.caresync.entity.auth.Role;
import com.bo.caresync.entity.patient.Patient;
import com.bo.caresync.entity.patient.PatientCaregiver;
import com.bo.caresync.entity.patient.PatientCaregiverPermission;
import com.bo.caresync.entity.user.User;
import com.bo.caresync.entity.user.UserRole;
import com.bo.caresync.enums.ErrorCode;
import com.bo.caresync.exceptions.BaseException;
import com.bo.caresync.repository.*;
import com.bo.caresync.service.authentication.ResetLinkService;
import com.bo.caresync.service.email.EmailService;
import com.bo.caresync.service.email.EmailTemplateService;
import com.bo.caresync.utils.AppUtil;
import com.bo.caresync.utils.LoginUserUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/6/2026, 4:31 PM,
 **/
@Slf4j
@Service
@RequiredArgsConstructor
public class CaregiverService {

    private final UserRepository userRepo;
    private final UserRoleRepository userRoleRepo;
    private final RoleRepository roleRepo;
    private final PatientCaregiverRepository caregiverRepo;
    private final PatientCaregiverPermissionRepository permissionRepo;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;
    private final LoginUserUtil loginUserUtil;
    private final PatientRepository patientRepo;
    private final EmailService emailService;
    private final EmailTemplateService  emailTemplateService;
    private final String className = this.getClass().getSimpleName();
    private final ResetLinkService resetLinkService;


    @Transactional(readOnly = true)
    public List<CaregiverResponse> getPatientCaregivers(Long patientId) {
        String methodName = AppUtil.getMethodName();

        log.info("{}{} Getting caregivers for patientId={}",className, methodName, patientId);
        loginUserUtil.requirePermission(patientId, "caregiver.view");
        List<PatientCaregiver> caregivers = caregiverRepo
                .findByPatientIdAndRecordStatus(patientId, AppConstants.RecordStatus.ACTIVE);
        List<CaregiverResponse> responses = new ArrayList<>();

        for (PatientCaregiver pc : caregivers) {
            Optional<User> userOpt = userRepo.findById(pc.getCaregiverUserId());
            if (userOpt.isEmpty()) {
                continue;
            }
            User user = userOpt.get();
            Optional<Role> roleOpt = roleRepo.findById(pc.getRoleId());
            String roleName = roleOpt.map(Role::getRoleName).orElse("UNKNOWN");
            String roleDisplayName = roleOpt.map(Role::getDisplayName).orElse("Unknown");

            responses.add(CaregiverResponse.builder()
                    .userId(user.getUserId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .phoneNumber(user.getPhoneNumber())
                    .roleId(pc.getRoleId())
                    .roleName(roleName)
                    .roleDisplayName(roleDisplayName)
                    .relationship(pc.getRelationship())
                    .build());
        }
        log.info("{} {}Found {} caregivers for patient {}",className, methodName, responses.size(), patientId);
        return responses;
    }

    /**
     * Invite a caregiver to a patient
     * Creates user if doesn't exist, links to patient, sends email
     */
    @Transactional
    public void inviteCaregiver(InviteCaregiverRequest request) {
        String methodName = "inviteCaregiver";

        log.debug("{} Inviting caregiver {} to patient {}",
                methodName, request.getEmail(), request.getPatientId());

        // Check permission
        loginUserUtil.requirePermission(request.getPatientId(), "caregiver.invite");

        // Check if user already exists
        Optional<User> existingUser = userRepo.findByEmail(request.getEmail());
        User caregiver;
        boolean isNewUser = false;

        if (existingUser.isPresent()) {
            caregiver = existingUser.get();
            log.info("{} User already exists: {}", methodName, request.getEmail());
        } else {
            // Create new user — NO temp password, account pending until they accept invite
            isNewUser = true;

            caregiver = new User();
            caregiver.setEmail(request.getEmail());
            caregiver.setFullName(request.getFullName());
            caregiver.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
            caregiver.setRecordStatus(AppConstants.RecordStatus.PENDING);
            caregiver.setIsEmailVerified(false);
            caregiver = userRepo.save(caregiver);

            UserRole userRole = new UserRole();
            userRole.setUserId(caregiver.getUserId());
            userRole.setRoleId(11113L);
            userRole.setRecordStatus(AppConstants.RecordStatus.ACTIVE);
            userRoleRepo.save(userRole);

            log.info("{} Created new pending caregiver user: {}", methodName, request.getEmail());
        }
        Optional<PatientCaregiver> existingLink = caregiverRepo
                .findByPatientIdAndCaregiverUserIdAndRecordStatus(
                        request.getPatientId(),
                        caregiver.getUserId(),
                        AppConstants.RecordStatus.ACTIVE
                );

        if (existingLink.isPresent()) {
            throw new BaseException(ErrorCode.RESOURCE_ALREADY_EXISTS,
                    "This caregiver is already linked to the patient");
        }
        Optional<PatientCaregiver> anyExistingLink = caregiverRepo
                .findByPatientIdAndCaregiverUserIdAndRecordStatus(request.getPatientId(), caregiver.getUserId(), AppConstants.RecordStatus.ACTIVE);

        PatientCaregiver link;
        if (anyExistingLink.isPresent()) {
            // Reactivate
            link = anyExistingLink.get();
            link.setRoleId(request.getRoleId());
            link.setRelationship(request.getRelationship());
            link.setRecordStatus(AppConstants.RecordStatus.ACTIVE);
            link.setModifiedAt(null);
            link.setModifiedBy(null);
        } else {
            link = new PatientCaregiver();
            link.setPatientId(request.getPatientId());
            link.setCaregiverUserId(caregiver.getUserId());
            link.setRoleId(request.getRoleId());
            link.setRelationship(request.getRelationship());
            link.setRecordStatus(AppConstants.RecordStatus.ACTIVE);
        }

        caregiverRepo.save(link);

        // Send email invitation
        try {
            String inviterName = loginUserUtil.getCurrentUser().getFullName();
            String patientName = "the patient";

            String subject = "Invitation to CareSync - Care Team";
            String body;

            if (isNewUser) {
                // Generate secure invite link
                String inviteLink = resetLinkService.generateLink(caregiver.getUserId(), "INVITE");

                body = emailTemplateService.getCaregiverInvitationBody(
                        inviterName,
                        patientName,
                        request.getEmail(),
                        inviteLink
                );
            } else {
                body = emailTemplateService.getCaregiverAddedBody(
                        request.getFullName(),
                        inviterName,
                        patientName
                );
            }

            emailService.sendSimpleEmail(request.getEmail(), subject, body);
            log.info("{} Invitation email sent to {}", methodName, request.getEmail());

        } catch (Exception e) {
            log.warn("{} Failed to send invitation email: {}", methodName, e.getMessage());
        }

        log.info("{} Successfully invited caregiver {} to patient {}",
                methodName, request.getEmail(), request.getPatientId());
    }




    @Transactional
    public void removeCaregiver(Long patientId, Long caregiverUserId) {
        String methodName = AppUtil.getMethodName();

        // Check permission
        loginUserUtil.requirePermission(patientId, AppConstants.Permission.CAREGIVER_REMOVE);

        // Cannot remove self
        if (caregiverUserId.equals(loginUserUtil.getCurrentUserId())) {
            throw new BaseException(ErrorCode.VALIDATION_ERROR,
                    MessageConstants.Caregiver.CANNOT_REMOVE_SELF);
        }

        PatientCaregiver link = caregiverRepo.findByPatientIdAndCaregiverUserIdAndRecordStatus(
                        patientId,
                        caregiverUserId,
                        AppConstants.RecordStatus.ACTIVE
                )
                .orElseThrow(() -> new BaseException(ErrorCode.PATIENT_CAREGIVER_NOT_FOUND));

        // Soft delete
        link.setRecordStatus(AppConstants.RecordStatus.INACTIVE);
        caregiverRepo.save(link);

        log.info("{} Caregiver removed: userId={}, patientId={}",
                methodName, caregiverUserId, patientId);
    }
    @Transactional
    public CaregiverResponse updateCaregiverRole(UpdateCaregiverRoleRequest request) {
        String methodName = AppUtil.getMethodName();

        // Check permission
        loginUserUtil.requirePermission(request.getPatientId(),
                AppConstants.Permission.CAREGIVER_EDIT_PERMISSIONS);

        PatientCaregiver link = caregiverRepo.findByPatientIdAndCaregiverUserIdAndRecordStatus(
                        request.getPatientId(),
                        request.getCaregiverUserId(),
                        AppConstants.RecordStatus.ACTIVE
                )
                .orElseThrow(() -> new BaseException(ErrorCode.PATIENT_CAREGIVER_NOT_FOUND));

        link.setRoleId(request.getNewRoleId());
        PatientCaregiver updated = caregiverRepo.save(link);

        User user = userRepo.findById(request.getCaregiverUserId())
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        log.info("{} Caregiver role updated: userId={}, patientId={}, newRoleId={}",
                methodName, request.getCaregiverUserId(), request.getPatientId(), request.getNewRoleId());

        return toCaregiverResponse(user, updated);
    }

    @Transactional
    public void grantPermission(GrantPermissionRequest request) {
        String methodName =AppUtil.getMethodName();
        Long currentUserId = loginUserUtil.getCurrentUserId();

        // Check permission to edit permissions
        loginUserUtil.requirePermission(request.getPatientId(),
                AppConstants.Permission.CAREGIVER_EDIT_PERMISSIONS);

        // Get permission ID
        Permission permission = permissionRepository.findByPermissionCode(request.getPermissionCode())
                .orElseThrow(() -> new BaseException(ErrorCode.PERMISSION_NOT_FOUND));

        // Check if override already exists
        Optional<PatientCaregiverPermission> existing = permissionRepo
                .findByPatientIdAndCaregiverUserIdAndPermissionIdAndRecordStatus(
                        request.getPatientId(),
                        request.getCaregiverUserId(),
                        permission.getPermissionId(),
                        AppConstants.RecordStatus.ACTIVE
                );

        if (existing.isPresent()) {
            // Update existing
            PatientCaregiverPermission pcp = existing.get();
            pcp.setIsGranted(request.getIsGranted());
            pcp.setExpiresAt(request.getExpiresAt());
            pcp.setNotes(request.getNotes());
            permissionRepo.save(pcp);
        } else {
            // Create new override
            PatientCaregiverPermission pcp = new PatientCaregiverPermission();
            pcp.setPatientId(request.getPatientId());
            pcp.setCaregiverUserId(request.getCaregiverUserId());
            pcp.setPermissionId(permission.getPermissionId());
            pcp.setIsGranted(request.getIsGranted());
            pcp.setGrantedByUserId(currentUserId);
            pcp.setExpiresAt(request.getExpiresAt());
            pcp.setNotes(request.getNotes());
            pcp.setRecordStatus(AppConstants.RecordStatus.ACTIVE);

            permissionRepo.save(pcp);
        }

        log.info("{} Permission {} for caregiver {} on patient {}",
                methodName,
                request.getIsGranted() ? "granted" : "denied",
                request.getCaregiverUserId(),
                request.getPatientId());
    }

    @Transactional
    public void acceptInvite(AcceptInviteRequest request) {
        String methodName = "acceptInvite";

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

        // Check this is an INVITE token, not a forgot-password token
        String linkType = payload.get("linkType");
        if (!"INVITE".equals(linkType)) {
            throw new BaseException(ErrorCode.INVALID_TOKEN, "Invalid invitation link");
        }

        Long userId = Long.parseLong(payload.get("userId"));
        String tokenId = payload.get("tokenId");
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setIsEmailVerified(true);
        user.setRecordStatus(AppConstants.RecordStatus.ACTIVE);

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
            user.setPhoneNumber(request.getPhoneNumber());
        }

        userRepo.save(user);
        resetLinkService.markTokenAsUsed(tokenId);

        log.info("{} Caregiver userId={} accepted invite and set password", methodName, userId);
    }

    private CaregiverResponse toCaregiverResponse(User user, PatientCaregiver link) {
        Role role = roleRepo.findById(link.getRoleId())
                .orElseThrow(() -> new BaseException(ErrorCode.ROLE_NOT_FOUND));

        return CaregiverResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .roleId(link.getRoleId())
                .roleName(role.getRoleName())
                .roleDisplayName(role.getDisplayName())
                .relationship(link.getRelationship())
                .isActive(AppConstants.RecordStatus.ACTIVE.equals(link.getRecordStatus()))
                .invitedAt(link.getCreatedAt())
                .build();
    }
}
