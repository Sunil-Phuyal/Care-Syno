package com.bo.caresync.dto.request.medication;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

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
    private Long medicationId;
    private String dosage;
    private String frequency;
    private String timeOfDay;
    private String instructions;
    private LocalDate startDate;
    private LocalDate endDate;
    private String recordStatus;
}