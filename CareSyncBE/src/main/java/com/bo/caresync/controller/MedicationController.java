package com.bo.caresync.controller;

import com.bo.caresync.dto.request.medication.CreateMedicationScheduleRequest;
import com.bo.caresync.dto.request.medication.LogMedicationRequest;
import com.bo.caresync.entity.medication.Medication;
import com.bo.caresync.entity.medication.MedicationAdministration;
import com.bo.caresync.entity.medication.MedicationSchedule;
import com.bo.caresync.service.medication.MedicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/6/2026, 3:38 PM,
 **/
@RestController
@RequestMapping("/api/v1/medications")
@RequiredArgsConstructor
public class MedicationController extends BaseController {

    private final MedicationService medicationService;

    @GetMapping
    public ResponseEntity<?> getAllMedications() {
        List<Medication> medications = medicationService.getAllMedications();
        return successResponse("Medications retrieved successfully", medications);
    }

    @PostMapping("/schedules")
    public ResponseEntity<?> createSchedule(@RequestBody CreateMedicationScheduleRequest request) {
        medicationService.createSchedule(request);
        return successResponse("Schedule created successfully", null);
    }

    @GetMapping("/schedules/patient/{patientId}")
    public ResponseEntity<?> getPatientSchedules(@PathVariable Long patientId) {
        List<MedicationSchedule> schedules = medicationService.getPatientSchedules(patientId);
        return successResponse("Schedules retrieved successfully", schedules);
    }

    @PostMapping("/administrations")
    public ResponseEntity<?> logAdministration(@RequestBody LogMedicationRequest request) {
        MedicationAdministration administration = medicationService.logAdministration(request);
        return successResponse("Medication logged successfully", administration);
    }

    @GetMapping("/administrations/patient/{patientId}")
    public ResponseEntity<?> getAdministrationHistory(@PathVariable Long patientId) {
        List<MedicationAdministration> history = medicationService.getAdministrationHistory(patientId);
        return successResponse("History retrieved successfully", history);
    }
}