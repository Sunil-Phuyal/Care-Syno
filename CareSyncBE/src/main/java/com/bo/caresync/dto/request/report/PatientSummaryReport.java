package com.bo.caresync.dto.request.report;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/6/2026, 7:38 PM,
 **/
@Getter
@Setter
public class PatientSummaryReport {
    private Long patientId;
    private String fullName;
    private Integer age;
    private LocalDate dateOfBirth;
    private Integer activeMedicationCount;
    private Integer totalCaregiversCount;
    private Double overallAdherencePercentage;
    private List<String> activeMedications;
    private List<String> caregivers;
}