package com.bo.caresync.repository;

import com.bo.caresync.entity.patient.PatientCaregiver;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/4/2026, 8:16 PM,
 **/
public interface PatientCaregiverRepository extends JpaRepository<PatientCaregiver, Long> {

    Optional<PatientCaregiver> findByPatientIdAndCaregiverUserIdAndRecordStatus(
            Long patientId,
            Long caregiverUserId,
            String recordStatus
    );

    Boolean existsByPatientIdAndCaregiverUserIdAndRecordStatus(
            Long patientId,
            Long caregiverUserId,
            String recordStatus
    );

    List<PatientCaregiver> findByCaregiverUserIdAndRecordStatus(
            Long caregiverUserId,
            String recordStatus
    );
}