package com.bo.caresync.controller;

import com.bo.caresync.dto.request.medication.*;
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
        medicationService.createMedicationSchedule(request);
        return successResponse("Schedule created successfully", null);
    }

    @GetMapping("/schedules/patient/{patientId}")
    public ResponseEntity<?> getPatientSchedules(@PathVariable Long patientId) {
        List<MedicationScheduleResponse> schedules = medicationService.getPatientSchedules(patientId);
        return successResponse("Schedules retrieved successfully", schedules);
    }

    @PostMapping("/administrations")
    public ResponseEntity<?> logAdministration(@RequestBody LogMedicationRequest request) {
        MedicationAdministrationResponse administration = medicationService.logAdministration(request);
        return successResponse("Medication logged successfully", administration);
    }

    @GetMapping("/administrations/patient/{patientId}")
    public ResponseEntity<?> getAdministrationHistory(@PathVariable Long patientId) {
        List<MedicationAdministration> history = medicationService.getAdministrationHistory(patientId);
        return successResponse("History retrieved successfully", history);
    }
    @GetMapping("/upcoming/{patientId}")
    public ResponseEntity<?> getUpcomingMedications(@PathVariable Long patientId) {
        List<UpcomingMedicationDTO> upcoming = medicationService.getUpcomingMedications(patientId);
        return successResponse("Upcoming medications retrieved successfully", upcoming);
    }

    @PutMapping("/schedules/{id}")
    public ResponseEntity<?> updateSchedule(@PathVariable Long id,
                                            @RequestBody UpdateMedicationScheduleRequest request) {
        MedicationScheduleResponse response = medicationService.updateMedicationSchedule(id, request);
        return successResponse("Schedule updated successfully", response);
    }

    @DeleteMapping("/schedules/{id}")
    public ResponseEntity<?> deleteSchedule(@PathVariable Long id) {
        medicationService.deleteSchedule(id);
        return successResponse("Schedule deleted successfully", null);
    }

    @GetMapping("/schedules/today")
    public ResponseEntity<?> getTodaySchedules(@RequestParam Long patientId) {
        List<TodayScheduleDTO> schedules = medicationService.getTodaySchedules(patientId);
        return successResponse("Today's schedules retrieved successfully", schedules);
    }

    /**
     * Create new medication (PRIMARY CAREGIVER only)
     * POST /api/v1/medications
     */
    @PostMapping
    public ResponseEntity<?> createMedication(@RequestBody CreateMedicationRequest request) {
        MedicationDTO medication = medicationService.createMedication(request);
        return successResponse("Medication added successfully", medication);
    }

    /**
     * Search medications by name
     * GET /api/v1/medications/search?query=met
     */
    @GetMapping("/search/{query}")
    public ResponseEntity<?> searchMedications(@PathVariable String query) {
        List<Medication> medications = medicationService.searchMedications(query);
        return successResponse("Search results retrieved", medications);
    }

    /**
     * Update medication (Admin, Primary CG, Healthcare only)
     * PUT /api/v1/medications/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMedication(@PathVariable Long id,
                                              @RequestBody UpdateMedicationRequest request) {
        MedicationDTO medication = medicationService.updateMedication(id, request);
        return successResponse("Medication updated successfully", medication);
    }

    /**
     * Delete medication - soft delete (Admin, Primary CG, Healthcare only)
     * DELETE /api/v1/medications/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMedication(@PathVariable Long id) {
        medicationService.deleteMedication(id);
        return successResponse("Medication deleted successfully", null);
    }
}