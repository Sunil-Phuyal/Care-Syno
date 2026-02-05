package com.bo.caresync.repository;

import com.bo.caresync.entity.medication.Medication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/5/2026, 7:56 PM,
 **/
public interface MedicationRepository extends JpaRepository<Medication, Long> {

    List<Medication> findByRecordStatus(String recordStatus);

    List<Medication> findByNameContainingIgnoreCaseAndRecordStatus(String name, String recordStatus);
}
