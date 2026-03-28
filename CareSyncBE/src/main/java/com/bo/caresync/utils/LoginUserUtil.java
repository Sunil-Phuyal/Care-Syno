package com.bo.caresync.utils;

import com.bo.caresync.constant.AppConstants;
import com.bo.caresync.constant.MessageConstants;
import com.bo.caresync.entity.user.User;
import com.bo.caresync.enums.ErrorCode;
import com.bo.caresync.exceptions.BaseException;
import com.bo.caresync.repository.PatientCaregiverRepository;
import com.bo.caresync.repository.UserRepository;
import com.bo.caresync.service.permession.PermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;


/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/4/2026, 6:08 PM,
 **/
@Slf4j
@Component
@RequiredArgsConstructor
public class LoginUserUtil {
    private final UserRepository userRepository;

    private final PatientCaregiverRepository patientCaregiverRepo;
    private final PermissionService permissionService;

    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BaseException(ErrorCode.UNAUTHORIZED, "No authenticated user");
        }

        String userIdStr = authentication.getName();
        return Long.parseLong(userIdStr);
    }
    public User getCurrentUser() {
        Long userId = getCurrentUserId();
        return userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND));
    }

    public String getCurrentUserEmail() {
        User user = getCurrentUser();
        return user.getEmail();
    }

    /**
     * Check if current user has access to a patient
     * Throws exception if no access
     */
    public void requirePatientAccess(Long patientId) {
        Long userId = getCurrentUserId();

        boolean hasAccess = patientCaregiverRepo.existsByPatientIdAndCaregiverUserIdAndRecordStatus(
                patientId,
                userId,
                AppConstants.RecordStatus.ACTIVE
        );

        if (!hasAccess) {
            log.warn("ACCESS DENIED: User {} attempted to access patient {}", userId, patientId);
            throw new BaseException(
                    ErrorCode.NO_PATIENT_ACCESS,
                    MessageConstants.Permission.NO_PATIENT_ACCESS
            );
        }
    }
    /**
     * Check if current user has access to a patient (returns boolean)
     */
    public boolean hasPatientAccess(Long patientId) {
        try {
            Long userId = getCurrentUserId();
            return patientCaregiverRepo.existsByPatientIdAndCaregiverUserIdAndRecordStatus(
                    patientId,
                    userId,
                    AppConstants.RecordStatus.ACTIVE
            );
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Get list of all patient IDs current user has access to
     */
    public List<Long> getAccessiblePatientIds() {
        Long userId = getCurrentUserId();
        return patientCaregiverRepo.findByCaregiverUserIdAndRecordStatus(
                        userId,
                        AppConstants.RecordStatus.ACTIVE
                )
                .stream()
                .map(pc -> pc.getPatientId())
                .collect(Collectors.toList());
    }

    /**
     * Check if current user has specific permission for a patient
     * Throws exception if permission denied
     */
    public void requirePermission(Long patientId, String permissionCode) {
        String methodName = AppUtil.getMethodName();
        Long userId = getCurrentUserId();

        // First check patient access
        requirePatientAccess(patientId);

        // Then check specific permission
        boolean hasPermission = permissionService.hasPermission(userId, permissionCode, patientId);

        if (!hasPermission) {
            log.warn("{} PERMISSION DENIED: User {} attempted {} for patient {}",
                    methodName, userId, permissionCode, patientId);
            throw new BaseException(
                    ErrorCode.PERMISSION_DENIED,
                    String.format("You don't have permission: %s. Contact the primary caregiver to request access.",
                            permissionCode)
            );
        }

        log.debug("{} PERMISSION GRANTED: User {} executing {} for patient {}",
                methodName, userId, permissionCode, patientId);
    }




}
