package com.bo.caresync.repository;

import com.bo.caresync.entity.medication.MedicationAdministration;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/5/2026, 8:07 PM,
 **/
public interface MedicationAdministrationRepository extends JpaRepository<MedicationAdministration, Long> {

    List<MedicationAdministration> findByPatientIdAndRecordStatusOrderByActualTimeDesc(
            Long patientId,
            String recordStatus
    );

    List<MedicationAdministration> findByPatientIdAndMedicationIdAndActualTimeBetweenAndRecordStatus(
            Long patientId,
            Long medicationId,
            LocalDateTime startTime,
            LocalDateTime endTime,
            String recordStatus
    );
    boolean existsByPatientIdAndScheduleIdAndActualTimeBetween(
            Long patientId,
            Long scheduleId,
            LocalDateTime startTime,
            LocalDateTime endTime
    );

    List<MedicationAdministration> findByPatientIdAndRecordStatusOrderByActualTimeDesc(
            Long patientId,
            String recordStatus,
            Pageable pageable
    );

    Optional<MedicationAdministration> findFirstByScheduleIdAndAdministeredAtBetweenOrderByAdministeredAtDesc(
            Long scheduleId,
            LocalDateTime start,
            LocalDateTime end
    );

    boolean existsByScheduleIdAndAdministeredAtBetween(
            Long scheduleId,
            LocalDateTime start,
            LocalDateTime end
    );

    List<MedicationAdministration> findByPatientIdAndRecordStatusOrderByAdministeredAtDesc(
            Long patientId,
            String recordStatus
    );
}
