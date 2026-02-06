package com.bo.caresync.dto.request.caregiver;

import lombok.Getter;
import lombok.Setter;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/6/2026, 3:53 PM,
 **/
@Getter
@Setter
public class InviteCaregiverRequest {
    private Long patientId;
    private String email;
    private String fullName;
    private Long roleId;
    private String relationship;
}