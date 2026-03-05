package com.bo.caresync.dto.request.medication;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 3/5/2026, 4:08 PM,
 **/
@Getter
@Setter
@Builder
@AllArgsConstructor
public class UpcomingMedicationDTO {

    private Long scheduleId;
    private Long medicationId;
    private String medicationName;
    private String dosage;
    private String instructions;
    private LocalDateTime scheduledTime;
    private Integer minutesUntilDue;
    private Boolean isOverdue;
}