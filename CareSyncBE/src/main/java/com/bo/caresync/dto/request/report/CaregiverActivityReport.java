package com.bo.caresync.dto.request.report;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/6/2026, 7:44 PM,
 **/
@Getter
@Setter
public class CaregiverActivityReport {
    private Long caregiverUserId;
    private String caregiverName;
    private Integer totalMedicationsLogged;
    private LocalDateTime lastActivity;
    private String reportPeriod;
}