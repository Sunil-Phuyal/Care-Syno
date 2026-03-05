package com.bo.caresync.repository;

import com.bo.caresync.entity.medication.MedicationSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/5/2026, 8:03 PM,
 **/
public interface MedicationScheduleRepository extends JpaRepository<MedicationSchedule, Long> {

    List<MedicationSchedule> findByPatientIdAndRecordStatus(Long patientId, String recordStatus);

    List<MedicationSchedule> findByRecordStatus(String recordStatus);
}
