package com.bo.caresync.controller;

import com.bo.caresync.constant.MessageConstants;
import com.bo.caresync.dto.request.caregiver.GrantPermissionRequest;
import com.bo.caresync.dto.request.caregiver.InviteCaregiverRequest;
import com.bo.caresync.dto.request.caregiver.UpdateCaregiverRoleRequest;
import com.bo.caresync.dto.response.caregiver.CaregiverResponse;
import com.bo.caresync.service.caregiver.CaregiverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/6/2026, 7:07 PM,
 **/
@RestController
@RequestMapping("/api/v1/caregivers")
@RequiredArgsConstructor
public class CaregiverController extends BaseController {

    private final CaregiverService caregiverService;

    @PostMapping("/invite")
    public ResponseEntity<?> inviteCaregiver(@RequestBody InviteCaregiverRequest request) {
        CaregiverResponse response = caregiverService.inviteCaregiver(request);
        return successResponse(MessageConstants.Caregiver.CAREGIVER_ADDED, response);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPatientCaregivers(@PathVariable Long patientId) {
        List<CaregiverResponse> caregivers = caregiverService.getPatientCaregivers(patientId);
        return successResponse("Caregivers retrieved successfully", caregivers);
    }

    @DeleteMapping("/patient/{patientId}/caregiver/{caregiverUserId}")
    public ResponseEntity<?> removeCaregiver(
            @PathVariable Long patientId,
            @PathVariable Long caregiverUserId) {
        caregiverService.removeCaregiver(patientId, caregiverUserId);
        return successResponse(MessageConstants.Caregiver.CAREGIVER_REMOVED, null);
    }

    @PutMapping("/role")
    public ResponseEntity<?> updateCaregiverRole(@RequestBody UpdateCaregiverRoleRequest request) {
        CaregiverResponse response = caregiverService.updateCaregiverRole(request);
        return successResponse(MessageConstants.Caregiver.ROLE_UPDATED, response);
    }

    @PostMapping("/permissions")
    public ResponseEntity<?> grantPermission(@RequestBody GrantPermissionRequest request) {
        caregiverService.grantPermission(request);
        String message = request.getIsGranted()
                ? MessageConstants.Permission.PERMISSION_GRANTED
                : MessageConstants.Permission.PERMISSION_REVOKED;
        return successResponse(message, null);
    }
}