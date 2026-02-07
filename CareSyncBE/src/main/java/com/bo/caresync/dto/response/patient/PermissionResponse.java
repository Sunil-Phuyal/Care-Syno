package com.bo.caresync.dto.response.patient;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/7/2026, 3:33 PM,
 **/
@Getter
@Setter
@Builder
@AllArgsConstructor
public class PermissionResponse {

    private Long userId;
    private Long patientId;
    private String patientName;
    private Long roleId;
    private String roleName;
    private String roleDisplayName;

    /**
     * Map of permission codes to boolean values
     * Example: {"patient.view": true, "patient.edit": false, ...}
     */
    private Map<String, Boolean> permissions;
}