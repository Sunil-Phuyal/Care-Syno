package com.bo.caresync.dto.request.medication;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/5/2026, 8:15 PM,
 **/
@Getter
@Setter
public class CreateMedicationScheduleRequest {
    private Long patientId;
    private Long medicationId;
    private String dosage;
    private String frequency;
    private List<String> times;
    private LocalDate startDate;
    private LocalDate endDate;
    private String specialInstructions;
    private String prescriptionImageUrl;
    private String medicationPhotoUrl;
}