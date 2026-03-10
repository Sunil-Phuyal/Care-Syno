package com.bo.caresync.dto.response.caregiver;

import lombok.Getter;
import lombok.Setter;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 3/10/2026, 11:38 AM,
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