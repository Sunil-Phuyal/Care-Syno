package com.bo.caresync.dto.request.medication;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/5/2026, 8:20 PM,
 **/
@Getter
@Setter
public class LogMedicationRequest {
    private Long patientId;
    private Long medicationId;
    private Long scheduleId;
    private LocalDateTime scheduledTime;
    private LocalDateTime actualTime;
    private String dosageGiven;
    private String status;
    private String notes;
    private String sideEffects;
    private String proofImageUrl;
}