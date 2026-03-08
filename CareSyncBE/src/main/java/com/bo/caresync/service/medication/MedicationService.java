package com.bo.caresync.service.medication;

import com.bo.caresync.constant.AppConstants;
import com.bo.caresync.dto.request.medication.*;
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

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
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
        schedule.setStartDate(request.getStartDate());   // assumed LocalDate in both request & entity
        schedule.setEndDate(request.getEndDate());       // assumed LocalDate in both request & entity
        schedule.setRecordStatus(AppConstants.RecordStatus.ACTIVE);
        scheduleRepo.save(schedule);

        log.info("{} Medication schedule created for patientId={}", methodName, request.getPatientId());
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

    @Transactional(readOnly = true)
    public List<UpcomingMedicationDTO> getUpcomingMedications(Long patientId) {
        String methodName = "getUpcomingMedications";

        log.debug("{} Getting upcoming medications for patientId={}", methodName, patientId);

        // Permission check
        loginUserUtil.requirePermission(patientId, "medication.view");

        // Get all active schedules for patient
        List<MedicationSchedule> schedules = scheduleRepo
                .findByPatientIdAndRecordStatus(patientId, AppConstants.RecordStatus.ACTIVE);

        List<UpcomingMedicationDTO> upcomingMedications = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime twoHoursLater = now.plusHours(2);

        for (MedicationSchedule schedule : schedules) {
            // Skip if no time specified
            if (schedule.getTimeOfDay() == null || schedule.getTimeOfDay().isEmpty()) {
                continue;
            }

            // Parse times (e.g., "8:00 AM, 2:00 PM, 8:00 PM")
            String[] times = schedule.getTimeOfDay().split(",");

            for (String timeStr : times) {
                try {
                    // Parse time
                    LocalTime time = parseTime(timeStr.trim());
                    LocalDateTime scheduledDateTime = LocalDate.now().atTime(time);

                    // If scheduled time is in the past today, skip
                    if (scheduledDateTime.isBefore(now.minusMinutes(30))) {
                        continue;
                    }

                    // If scheduled time is within next 2 hours
                    if (scheduledDateTime.isBefore(twoHoursLater)) {

                        // Check if already administered
                        boolean alreadyAdministered = administrationRepo
                                .existsByPatientIdAndScheduleIdAndActualTimeBetween(
                                        patientId,
                                        schedule.getScheduleId(),
                                        scheduledDateTime.minusMinutes(30),
                                        scheduledDateTime.plusMinutes(30)
                                );

                        if (!alreadyAdministered) {
                            long minutesUntil = Duration.between(now, scheduledDateTime).toMinutes();

                            // Get medication details
                            Optional<Medication> medication = medicationRepo
                                    .findById(schedule.getMedicationId());

                            upcomingMedications.add(UpcomingMedicationDTO.builder()
                                    .scheduleId(schedule.getScheduleId())
                                    .medicationId(schedule.getMedicationId())
                                    .medicationName(medication.map(Medication::getName).orElse("Unknown"))
                                    .dosage(schedule.getDosage())
                                    .instructions(schedule.getInstructions())
                                    .scheduledTime(scheduledDateTime)
                                    .minutesUntilDue((int) minutesUntil)
                                    .isOverdue(minutesUntil < 0)
                                    .build());
                        }
                    }
                } catch (Exception e) {
                    log.warn("Failed to parse time: {}", timeStr, e);
                }
            }
        }
        upcomingMedications.sort(Comparator.comparing(UpcomingMedicationDTO::getScheduledTime));

        log.info("{} Found {} upcoming medications", methodName, upcomingMedications.size());

        return upcomingMedications;
    }

    /**
     * Update a medication schedule
     */
    @Transactional
    public MedicationScheduleResponse updateSchedule(Long scheduleId, UpdateScheduleRequest request) {
        String methodName = "updateSchedule";

        log.debug("{} Updating schedule with ID={}", methodName, scheduleId);

        // Get existing schedule
        MedicationSchedule schedule = scheduleRepo.findById(scheduleId)
                .orElseThrow(() -> new BaseException(ErrorCode.RESOURCE_NOT_FOUND, "Schedule not found"));

        // Check permission
        loginUserUtil.requirePermission(schedule.getPatientId(), "medication.edit_schedule");

        // Update fields — entity uses LocalDate, request must also provide LocalDate
        if (request.getDosage() != null) {
            schedule.setDosage(request.getDosage());
        }
        if (request.getFrequency() != null) {
            schedule.setFrequency(request.getFrequency());
        }
        if (request.getTimeOfDay() != null) {
            schedule.setTimeOfDay(request.getTimeOfDay());
        }
        if (request.getInstructions() != null) {
            schedule.setInstructions(request.getInstructions());
        }
        if (request.getStartDate() != null) {
            schedule.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            schedule.setEndDate(request.getEndDate());
        }

        MedicationSchedule updated = scheduleRepo.save(schedule);

        log.info("{} Successfully updated schedule ID={}", methodName, scheduleId);

        return toScheduleResponse(updated);
    }

    /**
     * Delete a medication schedule (soft delete)
     */
    @Transactional
    public void deleteSchedule(Long scheduleId) {
        String methodName = "deleteSchedule";

        log.debug("{} Deleting schedule with ID={}", methodName, scheduleId);

        // Get existing schedule
        MedicationSchedule schedule = scheduleRepo.findById(scheduleId)
                .orElseThrow(() -> new BaseException(ErrorCode.RESOURCE_NOT_FOUND, "Schedule not found"));

        // Check permission
        loginUserUtil.requirePermission(schedule.getPatientId(), "medication.delete_schedule");

        // Soft delete
        schedule.setRecordStatus(AppConstants.RecordStatus.INACTIVE);
        schedule.setModifiedBy(loginUserUtil.getCurrentUserEmail());
        schedule.setModifiedAt(LocalDateTime.now());

        scheduleRepo.save(schedule);

        log.info("{} Successfully deleted schedule ID={}", methodName, scheduleId);
    }

    /**
     * Get today's medication schedules for a patient
     */
    @Transactional(readOnly = true)
    public List<TodayScheduleDTO> getTodaySchedules(Long patientId) {
        String methodName = "getTodaySchedules";

        log.debug("{} Getting today's schedules for patientId={}", methodName, patientId);

        // Check permission
        loginUserUtil.requirePermission(patientId, "medication.view");

        // Get all active schedules
        List<MedicationSchedule> schedules = scheduleRepo
                .findByPatientIdAndRecordStatus(patientId, AppConstants.RecordStatus.ACTIVE);

        List<TodayScheduleDTO> todaySchedules = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (MedicationSchedule schedule : schedules) {
            // Skip if no time specified
            if (schedule.getTimeOfDay() == null || schedule.getTimeOfDay().isEmpty()) {
                continue;
            }

            // FIX: entity field is already LocalDate — no need to call LocalDate.parse()
            LocalDate startDate = schedule.getStartDate();
            if (startDate != null && startDate.isAfter(today)) {
                continue; // Hasn't started yet
            }

            if (schedule.getEndDate() != null) {
                LocalDate endDate = schedule.getEndDate();  // FIX: already LocalDate
                if (endDate.isBefore(today)) {
                    continue; // Already ended
                }
            }

            // Parse times
            String[] times = schedule.getTimeOfDay().split(",");

            for (String timeStr : times) {
                try {
                    LocalTime time = parseTime(timeStr.trim());
                    LocalDateTime scheduledDateTime = today.atTime(time);

                    // Check if already administered
                    boolean administered = administrationRepo
                            .existsByPatientIdAndScheduleIdAndActualTimeBetween(
                                    patientId,
                                    schedule.getScheduleId(),
                                    scheduledDateTime.minusMinutes(30),
                                    scheduledDateTime.plusMinutes(30)
                            );

                    // Get medication details
                    Optional<Medication> medication = medicationRepo
                            .findById(schedule.getMedicationId());

                    todaySchedules.add(TodayScheduleDTO.builder()
                            .scheduleId(schedule.getScheduleId())
                            .medicationId(schedule.getMedicationId())
                            .medicationName(medication.map(Medication::getName).orElse("Unknown"))
                            .dosage(schedule.getDosage())
                            .scheduledTime(scheduledDateTime)
                            .isAdministered(administered)
                            .isPast(scheduledDateTime.isBefore(LocalDateTime.now()))
                            .instructions(schedule.getInstructions())
                            .build());

                } catch (Exception e) {
                    log.warn("Failed to parse time: {}", timeStr, e);
                }
            }
        }

        // Sort by scheduled time
        todaySchedules.sort(Comparator.comparing(TodayScheduleDTO::getScheduledTime));

        log.info("{} Found {} schedules for today", methodName, todaySchedules.size());

        return todaySchedules;
    }

    /**
     * Maps a MedicationSchedule entity to a MedicationScheduleResponse DTO.
     */
    private MedicationScheduleResponse toScheduleResponse(MedicationSchedule schedule) {
        return MedicationScheduleResponse.builder()
                .scheduleId(schedule.getScheduleId())
                .patientId(schedule.getPatientId())
                .medicationId(schedule.getMedicationId())
                .dosage(schedule.getDosage())
                .frequency(schedule.getFrequency())
                .timeOfDay(schedule.getTimeOfDay())
                .instructions(schedule.getInstructions())
                .startDate(schedule.getStartDate())
                .endDate(schedule.getEndDate())
                .recordStatus(schedule.getRecordStatus())
                .build();
    }

    /**
     * Parse time string like "8:00 AM" or "14:30" to LocalTime
     */
    private LocalTime parseTime(String timeStr) {
        try {
            // Try 12-hour format first (8:00 AM)
            DateTimeFormatter formatter12h = DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH);
            return LocalTime.parse(timeStr, formatter12h);
        } catch (Exception e1) {
            try {
                // Try 24-hour format (14:30)
                DateTimeFormatter formatter24h = DateTimeFormatter.ofPattern("HH:mm");
                return LocalTime.parse(timeStr, formatter24h);
            } catch (Exception e2) {
                throw new BaseException(ErrorCode.INVALID_INPUT, "Invalid time format: " + timeStr);
            }
        }
    }
}