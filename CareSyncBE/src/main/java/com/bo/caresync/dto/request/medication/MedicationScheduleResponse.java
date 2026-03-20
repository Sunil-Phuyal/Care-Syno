package com.bo.caresync.dto.request.medication;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 3/7/2026, 9:48 PM,
 **/
@Getter
@Setter
@Builder
public class MedicationScheduleResponse {

    private Long scheduleId;
    private Long patientId;
    private String patientName;
    private Long medicationId;
    private String medicationName;
    private String genericName;
    private String dosage;
    private String frequency;
    private LocalTime timeOfDay;
    private LocalDate startDate;
    private LocalDate endDate;
    private String specialInstructions;
    private String status;
    private String prescriptionImageUrl;
    private String medicationPhotoUrl;
    private String medicationImageUrl;
}