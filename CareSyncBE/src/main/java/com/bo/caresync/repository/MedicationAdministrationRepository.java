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
    List<MedicationAdministration> findByPatientIdAndRecordStatusOrderByAdministeredAtDesc(
            Long patientId,
            String recordStatus
    );
    boolean existsByScheduleIdAndAdministeredAtBetween(
            Long scheduleId,
            LocalDateTime start,
            LocalDateTime end
    );
    Optional<MedicationAdministration> findFirstByScheduleIdAndAdministeredAtBetweenOrderByAdministeredAtDesc(
            Long scheduleId,
            LocalDateTime start,
            LocalDateTime end
    );

    List<MedicationAdministration> findByPatientId(Long patientId);
}
