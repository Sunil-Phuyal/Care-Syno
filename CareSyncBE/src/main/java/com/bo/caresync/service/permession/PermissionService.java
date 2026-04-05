package com.bo.caresync.service.permession;

import com.bo.caresync.constant.AppConstants;
import com.bo.caresync.constant.MessageConstants;
import com.bo.caresync.dto.response.patient.PermissionResponse;
import com.bo.caresync.entity.auth.Permission;
import com.bo.caresync.entity.auth.Role;
import com.bo.caresync.entity.auth.RolePermission;
import com.bo.caresync.entity.patient.Patient;
import com.bo.caresync.entity.patient.PatientCaregiver;
import com.bo.caresync.entity.patient.PatientCaregiverPermission;
import com.bo.caresync.entity.user.UserRole;
import com.bo.caresync.enums.ErrorCode;
import com.bo.caresync.exceptions.BaseException;
import com.bo.caresync.repository.*;
import com.bo.caresync.utils.AppUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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
    private final PatientRepository patientRepo;
    private final RoleRepository roleRepo;

    /**
     * Check if user has specific permission for a patient
     *
     * @param userId         User ID
     * @param permissionCode Permission code (e.g., "medication.edit_schedule")
     * @param patientId      Patient ID
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

    /**
     * Get all permissions for a user on a specific patient
     * This is used by frontend to determine what UI elements to show
     *
     * @param userId    User ID
     * @param patientId Patient ID
     * @return PermissionResponse with all 18 permissions
     */
    @Transactional(readOnly = true)
    public PermissionResponse getUserPermissionsForPatient(Long userId, Long patientId) {
        String methodName = AppUtil.getMethodName();
        log.debug("{} Getting permissions for userId={}, patientId={}",
                methodName, userId, patientId);

        // Step 1: Verify user is linked to patient
        PatientCaregiver caregiverLink = patientCaregiverRepo
                .findByPatientIdAndCaregiverUserIdAndRecordStatus(
                        patientId,
                        userId,
                        AppConstants.RecordStatus.ACTIVE
                )
                .orElseThrow(() -> new BaseException(
                        ErrorCode.NO_PATIENT_ACCESS,
                        MessageConstants.Permission.NO_PATIENT_ACCESS
                ));

        // Step 2: Get patient details
        Patient patient = patientRepo.findByPatientIdAndRecordStatus(
                        patientId,
                        AppConstants.RecordStatus.ACTIVE
                )
                .orElseThrow(() -> new BaseException(ErrorCode.PATIENT_NOT_FOUND));

        // Step 3: Get role details
        Role role = roleRepo.findById(caregiverLink.getRoleId())
                .orElseThrow(() -> new BaseException(ErrorCode.ROLE_NOT_FOUND));

        // Step 4: Get all permissions
        List<Permission> allPermissions = permissionRepo.findByRecordStatus(
                AppConstants.RecordStatus.ACTIVE
        );

        // Step 5: Build permission map
        Map<String, Boolean> permissionMap = new HashMap<>();

        for (Permission permission : allPermissions) {
            boolean hasPermission = hasPermission(userId, permission.getPermissionCode(), patientId);
            permissionMap.put(permission.getPermissionCode(), hasPermission);
        }

        log.info("{} Loaded {} permissions for user {} on patient {}",
                methodName, permissionMap.size(), userId, patientId);

        // Step 6: Build response
        return PermissionResponse.builder()
                .userId(userId)
                .patientId(patientId)
                .patientName(patient.getFullName())
                .roleId(role.getRoleId())
                .roleName(role.getRoleName())
                .roleDisplayName(role.getDisplayName())
                .permissions(permissionMap)
                .build();


    }

    @Transactional(readOnly = true)
    public PermissionResponse getMyRolePermissions(Long userId) {
        String methodName = AppUtil.getMethodName();
        log.debug("{} Getting role-based permissions for userId={}", methodName, userId);

        // Step 1: Get user's roles from user_roles table
        List<UserRole> userRoles = userRoleRepo.findByUserId(userId);

        if (userRoles.isEmpty()) {
            log.warn("{} No roles found for userId={}", methodName, userId);
            // Return empty permissions rather than throwing
            return PermissionResponse.builder()
                    .userId(userId)
                    .patientId(null)
                    .patientName(null)
                    .roleId(null)
                    .roleName(null)
                    .roleDisplayName(null)
                    .permissions(new HashMap<>())
                    .build();
        }

        // Step 2: Get all permissions from DB
        List<Permission> allPermissions = permissionRepo.findByRecordStatus(
                AppConstants.RecordStatus.ACTIVE
        );

        // Step 3: Collect all role IDs for this user
        List<Long> roleIds = userRoles.stream()
                .map(UserRole::getRoleId)
                .collect(Collectors.toList());

        // Step 4: Get all role_permissions for those roles
        // Most permissive wins — if ANY role grants a permission, it's granted
        List<RolePermission> allRolePermissions = rolePermissionRepo
                .findByRoleIdInAndIsGrantedAndRecordStatus(
                        roleIds,
                        true,
                        AppConstants.RecordStatus.ACTIVE
                );

        Set<Long> grantedPermissionIds = allRolePermissions.stream()
                .map(RolePermission::getPermissionId)
                .collect(Collectors.toSet());

        // Step 5: Build permission map
        Map<String, Boolean> permissionMap = new HashMap<>();
        for (Permission permission : allPermissions) {
            permissionMap.put(
                    permission.getPermissionCode(),
                    grantedPermissionIds.contains(permission.getPermissionId())
            );
        }

        log.info("{} Loaded {} role-based permissions for userId={}",
                methodName, permissionMap.size(), userId);

        // Step 6: Use primary role for response metadata
        Long primaryRoleId = roleIds.get(0);
        Role primaryRole = roleRepo.findById(primaryRoleId)
                .orElse(null);

        return PermissionResponse.builder()
                .userId(userId)
                .patientId(null)
                .patientName(null)
                .roleId(primaryRoleId)
                .roleName(primaryRole != null ? primaryRole.getRoleName() : null)
                .roleDisplayName(primaryRole != null ? primaryRole.getDisplayName() : null)
                .permissions(permissionMap)
                .build();
}
}