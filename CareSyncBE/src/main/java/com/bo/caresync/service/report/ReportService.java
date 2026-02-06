package com.bo.caresync.service.report;

import com.bo.caresync.constant.AppConstants;

import com.bo.caresync.dto.request.report.MedicationAdherenceReport;
import com.bo.caresync.entity.medication.MedicationAdministration;
import com.bo.caresync.entity.medication.MedicationSchedule;
import com.bo.caresync.entity.patient.Patient;
import com.bo.caresync.entity.patient.PatientCaregiver;
import com.bo.caresync.entity.user.User;
import com.bo.caresync.enums.ErrorCode;
import com.bo.caresync.exceptions.BaseException;
import com.bo.caresync.repository.*;
import com.bo.caresync.utils.AppUtil;
import com.bo.caresync.utils.LoginUserUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/6/2026, 7:46 PM,
 **/
@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {
    private final PatientRepository patientRepo;
    private final PatientCaregiverRepository patientCaregiverRepo;
    private final MedicationScheduleRepository scheduleRepo;
    private final MedicationAdministrationRepository administrationRepo;
    private final UserRepository userRepo;
    private final LoginUserUtil loginUserUtil;

    @Transactional(readOnly = true)
    public MedicationAdherenceReport getMedicationAdherenceReport(Long patientId) {
        String methodName = AppUtil.getMethodName();

        // Check permission
        loginUserUtil.requirePermission(patientId, AppConstants.Permission.REPORT_VIEW);

        Patient patient = patientRepo.findByPatientIdAndRecordStatus(
                        patientId,
                        AppConstants.RecordStatus.ACTIVE
                )
                .orElseThrow(() -> new BaseException(ErrorCode.PATIENT_NOT_FOUND));

        // Get all administrations
        List<MedicationAdministration> administrations = administrationRepo
                .findByPatientIdAndRecordStatusOrderByActualTimeDesc(
                        patientId,
                        AppConstants.RecordStatus.ACTIVE
                );

        // Calculate statistics
        long administeredCount = administrations.stream()
                .filter(a -> "ADMINISTERED".equals(a.getStatus()))
                .count();

        long skippedCount = administrations.stream()
                .filter(a -> "SKIPPED".equals(a.getStatus()))
                .count();

        long missedCount = administrations.stream()
                .filter(a -> "MISSED".equals(a.getStatus()))
                .count();

        int totalDoses = administrations.size();
        double adherencePercentage = totalDoses > 0
                ? (administeredCount * 100.0) / totalDoses
                : 0.0;

        MedicationAdherenceReport report = new MedicationAdherenceReport();
        report.setPatientId(patientId);
        report.setPatientName(patient.getFullName());
        report.setTotalScheduledDoses(totalDoses);
        report.setAdministeredDoses((int) administeredCount);
        report.setSkippedDoses((int) skippedCount);
        report.setMissedDoses((int) missedCount);
        report.setAdherencePercentage(Math.round(adherencePercentage * 100.0) / 100.0);
        report.setReportPeriod("All time");

        log.info("{} Adherence report generated for patient {}: {}%",
                methodName, patientId, report.getAdherencePercentage());

        return report;
    }


}
