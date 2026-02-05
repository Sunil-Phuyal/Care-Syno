package com.bo.caresync.repository;

import com.bo.caresync.entity.patient.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/4/2026, 8:06 PM,
 **/
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByPatientIdAndRecordStatus(Long patientId, String recordStatus);
    Optional<Patient> findByFullNameAndDateOfBirthAndRecordStatus(
            String fullName,
            LocalDate dateOfBirth,
            String recordStatus
    );
}
