package com.bo.caresync.service.medication;

import com.bo.caresync.constant.AppConstants;
import com.bo.caresync.dto.request.medication.CreateMedicationScheduleRequest;
import com.bo.caresync.dto.request.medication.LogMedicationRequest;
import com.bo.caresync.entity.medication.Medication;
import com.bo.caresync.entity.medication.MedicationAdministration;
import com.bo.caresync.entity.medication.MedicationSchedule;
import com.bo.caresync.entity.patient.Patient;
import com.bo.caresync.entity.patient.PatientCaregiver;
import com.bo.caresync.entity.user.User;
import com.bo.caresync.enums.ErrorCode;
import com.bo.caresync.exceptions.BaseException;
import com.bo.caresync.repository.*;
import com.bo.caresync.service.email.EmailService;
import com.bo.caresync.service.email.EmailTemplateService;
import com.bo.caresync.utils.AppUtil;
import com.bo.caresync.utils.LoginUserUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/6/2026, 2:31 PM,
 **/
@Slf4j
@Service
@RequiredArgsConstructor
public class MedicationService {

    private final MedicationRepository medicationRepo;
    private final MedicationScheduleRepository scheduleRepo;
    private final MedicationAdministrationRepository administrationRepo;
    private final LoginUserUtil loginUserUtil;
    private final PatientRepository patientRepo;
    private final PatientCaregiverRepository patientCaregiverRepo;
    private final UserRepository userRepo;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;



    @Transactional(readOnly = true)
    public List<Medication> getAllMedications() {
        return medicationRepo.findByRecordStatus(AppConstants.RecordStatus.ACTIVE);
    }

    @Transactional
    public void createSchedule(CreateMedicationScheduleRequest request) {
        String methodName = AppUtil.getMethodName();

        // Check permission
        loginUserUtil.requirePermission(
                request.getPatientId(),
                AppConstants.Permission.MEDICATION_CREATE_SCHEDULE
        );

        MedicationSchedule schedule = new MedicationSchedule();
        schedule.setPatientId(request.getPatientId());
        schedule.setMedicationId(request.getMedicationId());
        schedule.setDosage(request.getDosage());
        schedule.setFrequency(request.getFrequency());
        schedule.setTimeOfDay(request.getTimeOfDay());
        schedule.setInstructions(request.getInstructions());
        schedule.setStartDate(request.getStartDate());
        schedule.setEndDate(request.getEndDate());
        schedule.setRecordStatus(AppConstants.RecordStatus.ACTIVE);
        scheduleRepo.save(schedule);

        log.info("{} Medication schedule created: scheduleId={}", methodName,getPatientSchedules(request.getPatientId()));
    }

    @Transactional(readOnly = true)
    public List<MedicationSchedule> getPatientSchedules(Long patientId) {
        String methodName = AppUtil.getMethodName();

        // Check permission
        loginUserUtil.requirePermission(patientId, AppConstants.Permission.MEDICATION_VIEW);

        List<MedicationSchedule> schedules = scheduleRepo.findByPatientIdAndRecordStatus(
                patientId,
                AppConstants.RecordStatus.ACTIVE
        );

        log.info("{} Retrieved {} schedules for patient {}",
                methodName, schedules.size(), patientId);
        return schedules;
    }

    @Transactional
    public MedicationAdministration logAdministration(LogMedicationRequest request) {
        String methodName = AppUtil.getMethodName();
        Long currentUserId = loginUserUtil.getCurrentUserId();

        // Check permission
        loginUserUtil.requirePermission(
                request.getPatientId(),
                AppConstants.Permission.MEDICATION_ADMINISTER
        );

        // Check for duplicate dose (within 4 hours)
        LocalDateTime fourHoursAgo = request.getActualTime().minusHours(4);
        List<MedicationAdministration> recentAdministrations = administrationRepo
                .findByPatientIdAndMedicationIdAndActualTimeBetweenAndRecordStatus(
                        request.getPatientId(),
                        request.getMedicationId(),
                        fourHoursAgo,
                        request.getActualTime(),
                        AppConstants.RecordStatus.ACTIVE
                );

        if (!recentAdministrations.isEmpty()) {
            log.warn("{} Duplicate dose detected within 4 hours for patient {} medication {}",
                    methodName, request.getPatientId(), request.getMedicationId());

            // Send warning email to all caregivers
            try {
                MedicationAdministration recent = recentAdministrations.get(0);
                User previousCaregiver = userRepo.findById(recent.getCaregiverUserId())
                        .orElse(null);
                User currentCaregiver = loginUserUtil.getCurrentUser();
                Patient patient = patientRepo.findById(request.getPatientId())
                        .orElseThrow(() -> new BaseException(ErrorCode.PATIENT_NOT_FOUND));
                Medication medication = medicationRepo.findById(request.getMedicationId())
                        .orElseThrow(() -> new BaseException(ErrorCode.MEDICATION_NOT_FOUND));

                // Get all caregivers for this patient
                List<PatientCaregiver> caregivers = patientCaregiverRepo
                        .findByPatientIdAndRecordStatus(request.getPatientId(), AppConstants.RecordStatus.ACTIVE);

                String[] caregiverEmails = caregivers.stream()
                        .map(pc -> userRepo.findById(pc.getCaregiverUserId()).orElse(null))
                        .filter(u -> u != null)
                        .map(User::getEmail)
                        .toArray(String[]::new);

                if (caregiverEmails.length > 0) {
                    String warningBody = emailTemplateService.getDuplicateDoseWarningBody(
                            currentCaregiver.getFullName(),
                            patient.getFullName(),
                            medication.getName(),
                            recent.getActualTime().toString(),
                            previousCaregiver != null ? previousCaregiver.getFullName() : "Unknown"
                    );

                    emailService.sendBulkEmail(
                            caregiverEmails,
                            "Duplicate Dose Warning - " + patient.getFullName(),
                            warningBody
                    );

                    log.info("{} Duplicate dose warning email sent to {} caregivers",
                            methodName, caregiverEmails.length);
                }
            } catch (Exception e) {
                log.error("{} Failed to send duplicate dose warning email", methodName, e);
                // Don't throw exception - the warning email is optional
            }
        }

        MedicationAdministration administration = new MedicationAdministration();
        administration.setPatientId(request.getPatientId());
        administration.setMedicationId(request.getMedicationId());
        administration.setScheduleId(request.getScheduleId());
        administration.setCaregiverUserId(currentUserId);
        administration.setScheduledTime(request.getScheduledTime());
        administration.setActualTime(request.getActualTime());
        administration.setDosageGiven(request.getDosageGiven());
        administration.setStatus(request.getStatus());
        administration.setNotes(request.getNotes());
        administration.setSideEffects(request.getSideEffects());
        administration.setRecordStatus(AppConstants.RecordStatus.ACTIVE);

        MedicationAdministration saved = administrationRepo.save(administration);

        log.info("{} Medication logged: administrationId={}, caregiverId={}",
                methodName, saved.getAdministrationId(), currentUserId);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<MedicationAdministration> getAdministrationHistory(Long patientId) {
        String methodName = AppUtil.getMethodName();

        // Check permission
        loginUserUtil.requirePermission(
                patientId,
                AppConstants.Permission.MEDICATION_VIEW_HISTORY
        );

        List<MedicationAdministration> history = administrationRepo
                .findByPatientIdAndRecordStatusOrderByActualTimeDesc(
                        patientId,
                        AppConstants.RecordStatus.ACTIVE
                );

        log.info("{} Retrieved {} administration records for patient {}",
                methodName, history.size(), patientId);
        return history;
    }
}