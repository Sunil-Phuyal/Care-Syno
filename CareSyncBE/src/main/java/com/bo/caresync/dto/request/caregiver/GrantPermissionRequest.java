package com.bo.caresync.dto.request.caregiver;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/6/2026, 3:55 PM,
 **/
@Getter
@Setter
public class GrantPermissionRequest {
    private Long patientId;
    private Long caregiverUserId;
    private String permissionCode;
    private Boolean isGranted;
    private LocalDateTime expiresAt;
    private String notes;
}