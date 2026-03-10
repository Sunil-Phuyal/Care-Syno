package com.bo.caresync.dto.response.caregiver;

import lombok.Getter;
import lombok.Setter;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 3/10/2026, 11:42 AM,
 **/
@Getter
@Setter
public class GrantPermissionRequest {
    private Long patientId;
    private Long caregiverUserId;
    private String permissionCode;
    private Boolean isGranted;
}