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
 * @since 3/5/2026, 6:32 PM,
 **/
@Getter
@Setter
@Builder
@AllArgsConstructor
public class TodayScheduleDTO {

    private Long scheduleId;
    private Long medicationId;
    private String medicationName;
    private String dosage;
    private LocalDateTime scheduledTime;
    private Boolean isAdministered;
    private Boolean isPast;
    private String instructions;
}