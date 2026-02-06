package com.bo.caresync.service.caregiver;

import com.bo.caresync.constant.AppConstants;
import com.bo.caresync.constant.MessageConstants;
import com.bo.caresync.dto.request.caregiver.InviteCaregiverRequest;
import com.bo.caresync.dto.request.caregiver.UpdateCaregiverRoleRequest;
import com.bo.caresync.dto.response.caregiver.CaregiverResponse;
import com.bo.caresync.entity.auth.Permission;
import com.bo.caresync.entity.auth.Role;
import com.bo.caresync.entity.patient.PatientCaregiver;
import com.bo.caresync.entity.patient.PatientCaregiverPermission;
import com.bo.caresync.entity.user.User;
import com.bo.caresync.entity.user.UserRole;
import com.bo.caresync.enums.ErrorCode;
import com.bo.caresync.exceptions.BaseException;
import com.bo.caresync.repository.*;
import com.bo.caresync.utils.AppUtil;
import com.bo.caresync.utils.LoginUserUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
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
    private final PatientCaregiverRepository patientCaregiverRepo;
    private final PatientCaregiverPermissionRepository permissionRepo;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;
    private final LoginUserUtil loginUserUtil;

    @Transactional
    public CaregiverResponse inviteCaregiver(InviteCaregiverRequest request) {
        String methodName = "inviteCaregiver";

        // Check permission
        loginUserUtil.requirePermission(request.getPatientId(), AppConstants.Permission.CAREGIVER_INVITE);

        // Check if already caregiver
        Optional<User> existingUser = userRepo.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            boolean alreadyLinked = patientCaregiverRepo.existsByPatientIdAndCaregiverUserIdAndRecordStatus(
                    request.getPatientId(),
                    existingUser.get().getUserId(),
                    AppConstants.RecordStatus.ACTIVE
            );

            if (alreadyLinked) {
                throw new BaseException(ErrorCode.VALIDATION_ERROR,
                        MessageConstants.Caregiver.ALREADY_CAREGIVER);
            }
        }

        // Create user if doesn't exist
        User caregiver;
        if (existingUser.isEmpty()) {
            caregiver = new User();
            caregiver.setEmail(request.getEmail());
            caregiver.setFullName(request.getFullName());
            // Generate temporary password
            String tempPassword = UUID.randomUUID().toString().substring(0, 8);
            caregiver.setPasswordHash(passwordEncoder.encode(tempPassword));
            caregiver.setIsEmailVerified(false);
            caregiver.setRecordStatus(AppConstants.RecordStatus.ACTIVE);

            caregiver = userRepo.save(caregiver);

            // Assign role to user
            UserRole userRole = new UserRole();
            userRole.setUserId(caregiver.getUserId());
            userRole.setRoleId(request.getRoleId());
            userRole.setRecordStatus(AppConstants.RecordStatus.ACTIVE);
            userRoleRepo.save(userRole);

            log.info("{} New user created for caregiver: email={}", methodName, request.getEmail());

            // TODO: Send email with temporary password
        } else {
            caregiver = existingUser.get();
        }

        // Link caregiver to patient
        PatientCaregiver link = new PatientCaregiver();
        link.setPatientId(request.getPatientId());
        link.setCaregiverUserId(caregiver.getUserId());
        link.setRoleId(request.getRoleId());
        link.setRelationship(request.getRelationship());
        link.setRecordStatus(AppConstants.RecordStatus.ACTIVE);

        patientCaregiverRepo.save(link);

        log.info("{} Caregiver invited: userId={}, patientId={}",
                methodName, caregiver.getUserId(), request.getPatientId());

        return toCaregiverResponse(caregiver, link);
    }

    @Transactional(readOnly = true)
    public List<CaregiverResponse> getPatientCaregivers(Long patientId) {
        String methodName = AppUtil.getMethodName();

        // Check permission
        loginUserUtil.requirePermission(patientId, AppConstants.Permission.CAREGIVER_VIEW);

        List<PatientCaregiver> caregivers = patientCaregiverRepo.findByPatientIdAndRecordStatus(
                patientId,
                AppConstants.RecordStatus.ACTIVE
        );

        return caregivers.stream()
                .map(pc -> {
                    User user = userRepo.findById(pc.getCaregiverUserId())
                            .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));
                    return toCaregiverResponse(user, pc);
                })
                .collect(Collectors.toList());
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

        PatientCaregiver link = patientCaregiverRepo.findByPatientIdAndCaregiverUserIdAndRecordStatus(
                        patientId,
                        caregiverUserId,
                        AppConstants.RecordStatus.ACTIVE
                )
                .orElseThrow(() -> new BaseException(ErrorCode.PATIENT_CAREGIVER_NOT_FOUND));

        // Soft delete
        link.setRecordStatus(AppConstants.RecordStatus.INACTIVE);
        patientCaregiverRepo.save(link);

        log.info("{} Caregiver removed: userId={}, patientId={}",
                methodName, caregiverUserId, patientId);
    }
    @Transactional
    public CaregiverResponse updateCaregiverRole(UpdateCaregiverRoleRequest request) {
        String methodName = "updateCaregiverRole";

        // Check permission
        loginUserUtil.requirePermission(request.getPatientId(),
                AppConstants.Permission.CAREGIVER_EDIT_PERMISSIONS);

        PatientCaregiver link = patientCaregiverRepo.findByPatientIdAndCaregiverUserIdAndRecordStatus(
                        request.getPatientId(),
                        request.getCaregiverUserId(),
                        AppConstants.RecordStatus.ACTIVE
                )
                .orElseThrow(() -> new BaseException(ErrorCode.PATIENT_CAREGIVER_NOT_FOUND));

        link.setRoleId(request.getNewRoleId());
        PatientCaregiver updated = patientCaregiverRepo.save(link);

        User user = userRepo.findById(request.getCaregiverUserId())
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));

        log.info("{} Caregiver role updated: userId={}, patientId={}, newRoleId={}",
                methodName, request.getCaregiverUserId(), request.getPatientId(), request.getNewRoleId());

        return toCaregiverResponse(user, updated);
    }

    private CaregiverResponse toCaregiverResponse(User user, PatientCaregiver link) {
        Role role = roleRepo.findById(link.getRoleId())
                .orElseThrow(() -> new BaseException(ErrorCode.ROLE_NOT_FOUND));

        CaregiverResponse response = new CaregiverResponse();
        response.setUserId(user.getUserId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setRoleName(role.getRoleName());
        response.setRoleDisplayName(role.getDisplayName());
        response.setRelationship(link.getRelationship());
        response.setIsActive(AppConstants.RecordStatus.ACTIVE.equals(link.getRecordStatus()));

        return response;
    }






}
