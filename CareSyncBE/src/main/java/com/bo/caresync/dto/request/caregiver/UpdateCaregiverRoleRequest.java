package com.bo.caresync.dto.request.caregiver;

import lombok.Getter;
import lombok.Setter;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/6/2026, 3:54 PM,
 **/
@Getter
@Setter
public class UpdateCaregiverRoleRequest {
    private Long patientId;
    private Long caregiverUserId;
    private Long newRoleId;
}