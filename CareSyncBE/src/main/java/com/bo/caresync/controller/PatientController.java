package com.bo.caresync.controller;

import com.bo.caresync.dto.request.patient.CreatePatientRequest;
import com.bo.caresync.dto.request.patient.UpdatePatientRequest;
import com.bo.caresync.dto.response.patient.PatientResponse;
import com.bo.caresync.service.patient.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/5/2026, 6:51 PM,
 **/
@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class PatientController extends BaseController {

    private final PatientService patientService;

    @PostMapping
    public ResponseEntity<?> createPatient(@RequestBody CreatePatientRequest request) {
         patientService.createPatient(request);
        return successResponse("Patient created successfully", HttpStatus.CREATED);
    }
    @GetMapping
    public ResponseEntity<?> getMyPatients() {
        List<PatientResponse> patients = patientService.getMyPatients();
        return successResponse("Patients retrieved successfully", patients);
    }
    @GetMapping("/{patientId}")
    public ResponseEntity<?> getPatient(@PathVariable Long patientId) {
        PatientResponse patient = patientService.getPatient(patientId);
        return successResponse("Patient retrieved successfully", patient);
    }
    @PutMapping("/{patientId}")
    public ResponseEntity<?> updatePatient(
            @PathVariable Long patientId,
            @RequestBody UpdatePatientRequest request) {
        PatientResponse updated = patientService.updatePatient(patientId, request);
        return successResponse("Patient updated successfully", updated);
    }
    @DeleteMapping("/{patientId}")
    public ResponseEntity<?> deletePatient(@PathVariable Long patientId) {
        patientService.deletePatient(patientId);
        return successResponse("Patient deleted successfully", null);
    }
}
