package com.bo.caresync.dto.response.caregiver;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/6/2026, 3:59 PM,
 **/
@Getter
@Setter
@Builder
@AllArgsConstructor
public class CaregiverResponse {
    private Long userId;
    private String email;
    private String fullName;
    private String phoneNumber;
    private Long roleId;
    private String roleName;
    private String roleDisplayName;
    private String relationship;
    private Boolean isActive;
}