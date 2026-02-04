package com.bo.caresync.repository;

import com.bo.caresync.entity.patient.PatientCaregiverPermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/4/2026, 8:27 PM,
 **/
public interface PatientCaregiverPermissionRepository extends JpaRepository<PatientCaregiverPermission, Long> {

    Optional<PatientCaregiverPermission> findByPatientIdAndCaregiverUserIdAndPermissionIdAndRecordStatus(
            Long patientId,
            Long caregiverUserId,
            Long permissionId,
            String recordStatus
    );

    List<PatientCaregiverPermission> findByPatientIdAndCaregiverUserIdAndRecordStatus(
            Long patientId,
            Long caregiverUserId,
            String recordStatus
    );
}
