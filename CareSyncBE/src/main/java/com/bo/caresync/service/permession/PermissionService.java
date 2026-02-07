package com.bo.caresync.service.permession;

import com.bo.caresync.constant.AppConstants;
import com.bo.caresync.constant.MessageConstants;
import com.bo.caresync.entity.auth.Permission;
import com.bo.caresync.entity.auth.RolePermission;
import com.bo.caresync.entity.patient.PatientCaregiver;
import com.bo.caresync.entity.patient.PatientCaregiverPermission;
import com.bo.caresync.enums.ErrorCode;
import com.bo.caresync.exceptions.BaseException;
import com.bo.caresync.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/4/2026, 9:25 PM,
 **/
@Slf4j
@Service
@RequiredArgsConstructor
public class PermissionService {

    private final PatientCaregiverRepository patientCaregiverRepo;
    private final PatientCaregiverPermissionRepository permissionOverrideRepo;
    private final UserRoleRepository userRoleRepo;
    private final RolePermissionRepository rolePermissionRepo;
    private final PermissionRepository permissionRepo;

    /**
     * Check if user has specific permission for a patient
     *
     * @param userId User ID
     * @param permissionCode Permission code (e.g., "medication.edit_schedule")
     * @param patientId Patient ID
     * @return true if user has permission, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean hasPermission(Long userId, String permissionCode, Long patientId) {
        String methodName = "hasPermission";

        log.debug("{} Checking permission: userId={}, permissionCode={}, patientId={}",
                methodName, userId, permissionCode, patientId);

        // STEP 1: Check if user is linked to patient
        Optional<PatientCaregiver> caregiverLink = patientCaregiverRepo
                .findByPatientIdAndCaregiverUserIdAndRecordStatus(
                        patientId,
                        userId,
                        AppConstants.RecordStatus.ACTIVE
                );

        if (caregiverLink.isEmpty()) {
            log.warn("{} User {} not linked to patient {}", methodName, userId, patientId);
            return false;
        }

        // STEP 2: Get permission ID
        Permission permission = permissionRepo.findByPermissionCode(permissionCode)
                .orElseThrow(() -> new BaseException(
                        ErrorCode.PERMISSION_NOT_FOUND,
                        "Permission not found: " + permissionCode
                ));

        // STEP 3: Check for permission override (patient_caregiver_permissions)
        Optional<PatientCaregiverPermission> override = permissionOverrideRepo
                .findByPatientIdAndCaregiverUserIdAndPermissionIdAndRecordStatus(
                        patientId,
                        userId,
                        permission.getPermissionId(),
                        AppConstants.RecordStatus.ACTIVE
                );

        if (override.isPresent()) {
            PatientCaregiverPermission pcp = override.get();

            // Check if override is expired
            if (pcp.getExpiresAt() != null && pcp.getExpiresAt().isBefore(LocalDateTime.now())) {
                log.debug("{} Permission override expired for user {} on patient {}",
                        methodName, userId, patientId);
                // Override expired, fall through to role default
            } else {
                // Override is active and not expired
                log.debug("{} Permission override found: isGranted={}", methodName, pcp.getIsGranted());
                return pcp.getIsGranted();
            }
        }

        // STEP 4: Check role default permissions
        // Get user's role for THIS patient (from patient_caregivers table)
        Long roleId = caregiverLink.get().getRoleId();

        // Check if role has this permission
        List<RolePermission> rolePermissions = rolePermissionRepo
                .findByRoleIdAndIsGrantedAndRecordStatus(
                        roleId,
                        true,
                        AppConstants.RecordStatus.ACTIVE
                );

        boolean hasRolePermission = rolePermissions.stream()
                .anyMatch(rp -> rp.getPermissionId().equals(permission.getPermissionId()));

        log.debug("{} Role permission check: roleId={}, hasPermission={}",
                methodName, roleId, hasRolePermission);

        return hasRolePermission;
    }


}