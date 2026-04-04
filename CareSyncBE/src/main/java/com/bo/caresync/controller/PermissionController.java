package com.bo.caresync.controller;

import com.bo.caresync.dto.response.patient.PermissionResponse;
import com.bo.caresync.service.permession.PermissionService;
import com.bo.caresync.utils.LoginUserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/7/2026, 3:38 PM,
 **/
@RestController
@RequestMapping("/api/v1/permissions")
@RequiredArgsConstructor
public class PermissionController extends BaseController {

    private final PermissionService permissionService;
    private final LoginUserUtil loginUserUtil;

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPermissionsForPatient(@PathVariable Long patientId) {
        Long currentUserId = loginUserUtil.getCurrentUserId();
        PermissionResponse response = permissionService.getUserPermissionsForPatient(
                currentUserId,
                patientId
        );
        return successResponse("Permissions retrieved successfully", response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyRolePermissions() {
        Long currentUserId = loginUserUtil.getCurrentUserId();
        PermissionResponse response = permissionService.getMyRolePermissions(currentUserId);
        return successResponse("Role permissions retrieved successfully", response);
    }
}