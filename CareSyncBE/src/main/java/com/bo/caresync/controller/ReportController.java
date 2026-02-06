package com.bo.caresync.controller;

import com.bo.caresync.dto.request.report.MedicationAdherenceReport;
import com.bo.caresync.dto.request.report.PatientSummaryReport;
import com.bo.caresync.service.report.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/6/2026, 8:04 PM,
 **/
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController extends BaseController {

    private final ReportService reportService;

    @GetMapping("/adherence/patient/{patientId}")
    public ResponseEntity<?> getMedicationAdherenceReport(@PathVariable Long patientId) {
        MedicationAdherenceReport report = reportService.getMedicationAdherenceReport(patientId);
        return successResponse("Adherence report generated successfully", report);
    }

    @GetMapping("/summary/patient/{patientId}")
    public ResponseEntity<?> getPatientSummary(@PathVariable Long patientId) {
        PatientSummaryReport summary = reportService.getPatientSummary(patientId);
        return successResponse("Patient summary generated successfully", summary);
    }
}
