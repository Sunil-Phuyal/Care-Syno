package com.bo.caresync.dto.request.medication;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 3/20/2026, 11:21 AM,
 **/
@Getter
@Setter
@Builder
@AllArgsConstructor
public class MedicationAdministrationResponse {
    private Long administrationId;
    private Long scheduleId;
    private Long patientId;
    private String patientName;
    private Long medicationId;
    private String medicationName;
    private String dosage;
    private LocalDateTime administeredAt;
    private Long administeredBy;
    private String administeredByName;
    private String status;
    private String notes;
    private String proofImageUrl;
}