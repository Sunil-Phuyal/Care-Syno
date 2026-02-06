package com.bo.caresync.dto.request.report;

import lombok.Getter;
import lombok.Setter;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/6/2026, 7:32 PM,
 **/
@Getter
@Setter
public class MedicationAdherenceReport {
    private Long patientId;
    private String patientName;
    private Integer totalScheduledDoses;
    private Integer administeredDoses;
    private Integer skippedDoses;
    private Integer missedDoses;
    private Double adherencePercentage;
    private String reportPeriod;
}