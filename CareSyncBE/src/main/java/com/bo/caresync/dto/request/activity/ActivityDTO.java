package com.bo.caresync.dto.request.activity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 3/7/2026, 09:35 PM,
 **/
@Getter
@Setter
@Builder
@AllArgsConstructor
public class ActivityDTO {

    private Long activityId;
    private String activityType;
    private String description;
    private String performedByName;
    private String performedByEmail;
    private String patientName;
    private Long patientId;
    private LocalDateTime timestamp;
    private String icon;
    private String color;
}