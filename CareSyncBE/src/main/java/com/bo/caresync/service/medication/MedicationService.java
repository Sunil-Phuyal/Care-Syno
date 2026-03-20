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

/**
 * Service for medication management
 *
 * @author Sunil Phuyal
 * @version 1.0
 * @project CareSyncBE
 * @since 2/6/2026
 */
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
    public MedicationScheduleResponse createMedicationSchedule(CreateMedicationScheduleRequest request) {
        String methodName = "createMedicationSchedule";

        log.debug("{} Creating medication schedule for patient {}", methodName, request.getPatientId());
        loginUserUtil.requirePermission(request.getPatientId(), "medication.create_schedule");
        Medication medication = medicationRepo.findById(request.getMedicationId())
                .orElseThrow(() -> new BaseException(ErrorCode.RESOURCE_NOT_FOUND, "Medication not found"));
        Patient patient = patientRepo.findById(request.getPatientId())
                .orElseThrow(() -> new BaseException(ErrorCode.RESOURCE_NOT_FOUND, "Patient not found"));
        List<MedicationSchedule> schedules = new ArrayList<>();

        for (String timeStr : request.getTimes()) {
            LocalTime time = parseTime(timeStr);

            MedicationSchedule schedule = new MedicationSchedule();
            schedule.setPatientId(request.getPatientId());
            schedule.setMedicationId(request.getMedicationId());
            schedule.setDosage(request.getDosage());
            schedule.setFrequency(request.getFrequency());
            schedule.setTimeOfDay(time);
            schedule.setStartDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now());
            schedule.setEndDate(request.getEndDate());
            schedule.setSpecialInstructions(request.getSpecialInstructions());
            schedule.setRecordStatus(AppConstants.RecordStatus.ACTIVE);
            if (request.getPrescriptionImageUrl() != null && !request.getPrescriptionImageUrl().isEmpty()) {
                schedule.setPrescriptionImageUrl(request.getPrescriptionImageUrl());
                log.debug("{} Prescription image attached", methodName);
            }

            if (request.getMedicationPhotoUrl() != null && !request.getMedicationPhotoUrl().isEmpty()) {
                schedule.setMedicationPhotoUrl(request.getMedicationPhotoUrl());
                log.debug("{} Medication photo attached", methodName);
            }

            schedules.add(schedule);
        }
        schedules = scheduleRepo.saveAll(schedules);

        log.info("{} Created {} medication schedules for patient {}",
                methodName, schedules.size(), request.getPatientId());
        MedicationSchedule firstSchedule = schedules.get(0);

        return MedicationScheduleResponse.builder()
                .scheduleId(firstSchedule.getScheduleId())
                .patientId(firstSchedule.getPatientId())
                .patientName(patient.getFullName())
                .medicationId(firstSchedule.getMedicationId())
                .medicationName(medication.getMedicationName())
                .genericName(medication.getGenericName())
                .dosage(firstSchedule.getDosage())
                .frequency(firstSchedule.getFrequency())
                .timeOfDay(firstSchedule.getTimeOfDay())
                .startDate(firstSchedule.getStartDate())
                .endDate(firstSchedule.getEndDate())
                .specialInstructions(firstSchedule.getSpecialInstructions())
                .prescriptionImageUrl(firstSchedule.getPrescriptionImageUrl())
                .medicationPhotoUrl(firstSchedule.getMedicationPhotoUrl())
                .medicationImageUrl(medication.getMedicationImageUrl())
                .status(AppConstants.RecordStatus.ACTIVE)
                .build();
    }

    @Transactional(readOnly = true)
    public List<MedicationSchedule> getPatientSchedules(Long patientId) {
        String methodName = "getPatientSchedules";

        loginUserUtil.requirePermission(patientId, "medication.view");

        List<MedicationSchedule> schedules = scheduleRepo.findByPatientIdAndRecordStatus(
                patientId,
                AppConstants.RecordStatus.ACTIVE
        );

        log.info("{} Retrieved {} schedules for patient {}", methodName, schedules.size(), patientId);

        return schedules;
    }

    @Transactional
    public MedicationScheduleResponse updateMedicationSchedule(Long scheduleId, UpdateMedicationScheduleRequest request) {
        String methodName = "updateMedicationSchedule";

        log.debug("{} Updating schedule {}", methodName, scheduleId);
        MedicationSchedule schedule = scheduleRepo.findById(scheduleId)
                .orElseThrow(() -> new BaseException(ErrorCode.RESOURCE_NOT_FOUND, "Schedule not found"));
        loginUserUtil.requirePermission(schedule.getPatientId(), "medication.edit_schedule");
        if (request.getDosage() != null && !request.getDosage().isEmpty()) {
            schedule.setDosage(request.getDosage());
        }
        if (request.getFrequency() != null && !request.getFrequency().isEmpty()) {
            schedule.setFrequency(request.getFrequency());
        }
        if (request.getTimeOfDay() != null) {
            schedule.setTimeOfDay(request.getTimeOfDay());
        }
        if (request.getStartDate() != null) {
            schedule.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            schedule.setEndDate(request.getEndDate());
        }
        if (request.getInstructions() != null) {
            schedule.setSpecialInstructions(request.getInstructions());
        }

        if (request.getPrescriptionImageUrl() != null && !request.getPrescriptionImageUrl().isEmpty()) {
            schedule.setPrescriptionImageUrl(request.getPrescriptionImageUrl());
            log.debug("{} Prescription image updated", methodName);
        }

        if (request.getMedicationPhotoUrl() != null && !request.getMedicationPhotoUrl().isEmpty()) {
            schedule.setMedicationPhotoUrl(request.getMedicationPhotoUrl());
            log.debug("{} Medication photo updated", methodName);
        }

        schedule = scheduleRepo.save(schedule);

        // Get medication and patient details
        Medication medication = medicationRepo.findById(schedule.getMedicationId())
                .orElseThrow(() -> new BaseException(ErrorCode.RESOURCE_NOT_FOUND, "Medication not found"));

        Patient patient = patientRepo.findById(schedule.getPatientId())
                .orElseThrow(() -> new BaseException(ErrorCode.RESOURCE_NOT_FOUND, "Patient not found"));

        log.info("{} Schedule {} updated successfully", methodName, scheduleId);

        return MedicationScheduleResponse.builder()
                .scheduleId(schedule.getScheduleId())
                .patientId(schedule.getPatientId())
                .patientName(patient.getFullName())
                .medicationId(schedule.getMedicationId())
                .medicationName(medication.getMedicationName())
                .genericName(medication.getGenericName())
                .dosage(schedule.getDosage())
                .frequency(schedule.getFrequency())
                .timeOfDay(schedule.getTimeOfDay())
                .startDate(schedule.getStartDate())
                .endDate(schedule.getEndDate())
                .specialInstructions(schedule.getSpecialInstructions())
                .prescriptionImageUrl(schedule.getPrescriptionImageUrl())
                .medicationPhotoUrl(schedule.getMedicationPhotoUrl())
                .medicationImageUrl(medication.getMedicationImageUrl())
                .status(schedule.getRecordStatus())
                .build();
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
     * Log medication administration with proof image
     */
    @Transactional
    public MedicationAdministrationResponse logAdministration(LogMedicationRequest request) {
        String methodName = "logAdministration";

        Long currentUserId = loginUserUtil.getCurrentUserId();

        // Validate schedule exists
        MedicationSchedule schedule = scheduleRepo.findById(request.getScheduleId())
                .orElseThrow(() -> new BaseException(ErrorCode.RESOURCE_NOT_FOUND, "Schedule not found"));

        // Check permission
        loginUserUtil.requirePermission(schedule.getPatientId(), "medication.administer");

        // Check for duplicate dose (within 1 hour)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneHourAgo = now.minusHours(1);

        Optional<MedicationAdministration> recentLog = administrationRepo
                .findFirstByScheduleIdAndAdministeredAtBetweenOrderByAdministeredAtDesc(
                        request.getScheduleId(),
                        oneHourAgo,
                        now
                );

        if (recentLog.isPresent()) {
            log.warn("{} Duplicate dose detected within 1 hour for schedule {}", methodName, request.getScheduleId());

            // Send warning email to caregivers
            try {
                sendDuplicateDoseWarning(schedule, recentLog.get(), currentUserId);
            } catch (Exception e) {
                log.error("{} Failed to send duplicate dose warning", methodName, e);
            }

            throw new BaseException(ErrorCode.DUPLICATE_ADMINISTRATION,
                    "This medication was already logged in the last hour");
        }

        // Create administration log
        MedicationAdministration administration = new MedicationAdministration();
        administration.setScheduleId(request.getScheduleId());
        administration.setPatientId(schedule.getPatientId());
        administration.setMedicationId(schedule.getMedicationId());
        administration.setAdministeredAt(now);
        administration.setAdministeredBy(currentUserId);
        administration.setStatus(request.getStatus());
        administration.setNotes(request.getNotes());
        administration.setRecordStatus(AppConstants.RecordStatus.ACTIVE);

        // Set proof image if provided
        if (request.getProofImageUrl() != null && !request.getProofImageUrl().isEmpty()) {
            administration.setProofImageUrl(request.getProofImageUrl());
            log.debug("{} Proof image attached", methodName);
        }

        administration = administrationRepo.save(administration);

        // Get details for response
        Medication medication = medicationRepo.findById(schedule.getMedicationId())
                .orElseThrow(() -> new BaseException(ErrorCode.RESOURCE_NOT_FOUND, "Medication not found"));

        Patient patient = patientRepo.findById(schedule.getPatientId())
                .orElseThrow(() -> new BaseException(ErrorCode.RESOURCE_NOT_FOUND, "Patient not found"));

        User caregiver = userRepo.findById(currentUserId)
                .orElseThrow(() -> new BaseException(ErrorCode.USER_NOT_FOUND, "User not found"));

        log.info("{} Medication {} logged as {} by user {}",
                methodName, medication.getMedicationName(), request.getStatus(), caregiver.getFullName());

        return MedicationAdministrationResponse.builder()
                .administrationId(administration.getAdministrationId())
                .scheduleId(administration.getScheduleId())
                .patientId(administration.getPatientId())
                .patientName(patient.getFullName())
                .medicationId(administration.getMedicationId())
                .medicationName(medication.getMedicationName())
                .dosage(schedule.getDosage())
                .administeredAt(administration.getAdministeredAt())
                .administeredBy(administration.getAdministeredBy())
                .administeredByName(caregiver.getFullName())
                .status(administration.getStatus())
                .notes(administration.getNotes())
                .proofImageUrl(administration.getProofImageUrl())
                .build();
    }

    /**
     * Get medication administration history
     */
    @Transactional(readOnly = true)
    public List<MedicationAdministration> getAdministrationHistory(Long patientId) {
        String methodName = "getAdministrationHistory";

        loginUserUtil.requirePermission(patientId, "medication.view_history");

        List<MedicationAdministration> history = administrationRepo
                .findByPatientIdAndRecordStatusOrderByAdministeredAtDesc(
                        patientId,
                        AppConstants.RecordStatus.ACTIVE
                );

        log.info("{} Retrieved {} administration records for patient {}", methodName, history.size(), patientId);

        return history;
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
            if (schedule.getTimeOfDay() == null) {
                continue;
            }

            // Check if schedule is active today
            if (schedule.getStartDate() != null && schedule.getStartDate().isAfter(today)) {
                continue; // Hasn't started yet
            }

            if (schedule.getEndDate() != null && schedule.getEndDate().isBefore(today)) {
                continue; // Already ended
            }

            // Parse time
            LocalTime time = schedule.getTimeOfDay();
            LocalDateTime scheduledDateTime = today.atTime(time);

            // Check if already administered
            boolean administered = administrationRepo
                    .existsByScheduleIdAndAdministeredAtBetween(
                            schedule.getScheduleId(),
                            scheduledDateTime.minusMinutes(30),
                            scheduledDateTime.plusMinutes(30)
                    );

            // Get medication details
            Medication medication = medicationRepo.findById(schedule.getMedicationId())
                    .orElse(null);

            todaySchedules.add(TodayScheduleDTO.builder()
                    .scheduleId(schedule.getScheduleId())
                    .medicationId(schedule.getMedicationId())
                    .medicationName(medication != null ? medication.getMedicationName() : "Unknown")
                    .dosage(schedule.getDosage())
                    .scheduledTime(scheduledDateTime)
                    .isAdministered(administered)
                    .isPast(scheduledDateTime.isBefore(LocalDateTime.now()))
                    .instructions(schedule.getSpecialInstructions())
                    .build());
        }

        // Sort by scheduled time
        todaySchedules.sort(Comparator.comparing(TodayScheduleDTO::getScheduledTime));

        log.info("{} Found {} schedules for today", methodName, todaySchedules.size());

        return todaySchedules;
    }

    /**
     * Get upcoming medications (next 2 hours)
     */
    @Transactional(readOnly = true)
    public List<UpcomingMedicationDTO> getUpcomingMedications(Long patientId) {
        String methodName = "getUpcomingMedications";

        log.debug("{} Getting upcoming medications for patientId={}", methodName, patientId);

        loginUserUtil.requirePermission(patientId, "medication.view");

        List<MedicationSchedule> schedules = scheduleRepo
                .findByPatientIdAndRecordStatus(patientId, AppConstants.RecordStatus.ACTIVE);

        List<UpcomingMedicationDTO> upcomingMedications = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime twoHoursLater = now.plusHours(2);
        LocalDate today = LocalDate.now();

        for (MedicationSchedule schedule : schedules) {
            if (schedule.getTimeOfDay() == null) {
                continue;
            }

            LocalTime time = schedule.getTimeOfDay();
            LocalDateTime scheduledDateTime = today.atTime(time);

            // Skip if more than 30 minutes in the past
            if (scheduledDateTime.isBefore(now.minusMinutes(30))) {
                continue;
            }

            // If scheduled time is within next 2 hours
            if (scheduledDateTime.isBefore(twoHoursLater)) {
                // Check if already administered
                boolean alreadyAdministered = administrationRepo
                        .existsByScheduleIdAndAdministeredAtBetween(
                                schedule.getScheduleId(),
                                scheduledDateTime.minusMinutes(30),
                                scheduledDateTime.plusMinutes(30)
                        );

                if (!alreadyAdministered) {
                    long minutesUntil = Duration.between(now, scheduledDateTime).toMinutes();

                    // Get medication details
                    Medication medication = medicationRepo.findById(schedule.getMedicationId())
                            .orElse(null);

                    upcomingMedications.add(UpcomingMedicationDTO.builder()
                            .scheduleId(schedule.getScheduleId())
                            .medicationId(schedule.getMedicationId())
                            .medicationName(medication != null ? medication.getMedicationName() : "Unknown")
                            .dosage(schedule.getDosage())
                            .instructions(schedule.getSpecialInstructions())
                            .scheduledTime(scheduledDateTime)
                            .minutesUntilDue((int) minutesUntil)
                            .isOverdue(minutesUntil < 0)
                            .build());
                }
            }
        }

        upcomingMedications.sort(Comparator.comparing(UpcomingMedicationDTO::getScheduledTime));

        log.info("{} Found {} upcoming medications", methodName, upcomingMedications.size());

        return upcomingMedications;
    }

    /**
     * Send duplicate dose warning email
     */
    private void sendDuplicateDoseWarning(MedicationSchedule schedule, MedicationAdministration recentLog, Long currentUserId) {
        try {
            Patient patient = patientRepo.findById(schedule.getPatientId()).orElse(null);
            Medication medication = medicationRepo.findById(schedule.getMedicationId()).orElse(null);
            User currentCaregiver = userRepo.findById(currentUserId).orElse(null);
            User previousCaregiver = userRepo.findById(recentLog.getAdministeredBy()).orElse(null);

            if (patient == null || medication == null || currentCaregiver == null) {
                return;
            }

            // Get all caregivers for this patient
            List<PatientCaregiver> caregivers = patientCaregiverRepo
                    .findByPatientIdAndRecordStatus(schedule.getPatientId(), AppConstants.RecordStatus.ACTIVE);

            List<String> caregiverEmails = new ArrayList<>();
            for (PatientCaregiver pc : caregivers) {
                User caregiver = userRepo.findById(pc.getCaregiverUserId()).orElse(null);
                if (caregiver != null && caregiver.getEmail() != null) {
                    caregiverEmails.add(caregiver.getEmail());
                }
            }

            if (!caregiverEmails.isEmpty()) {
                String subject = "⚠️ Duplicate Dose Warning - " + patient.getFullName();
                String body = emailTemplateService.getDuplicateDoseWarningBody(
                        currentCaregiver.getFullName(),
                        patient.getFullName(),
                        medication.getMedicationName(),
                        recentLog.getAdministeredAt().toString(),
                        previousCaregiver != null ? previousCaregiver.getFullName() : "Unknown"
                );

                emailService.sendBulkEmail(
                        caregiverEmails.toArray(new String[0]),
                        subject,
                        body
                );

                log.info("Duplicate dose warning email sent to {} caregivers", caregiverEmails.size());
            }
        } catch (Exception e) {
            log.error("Failed to send duplicate dose warning", e);
        }
    }

    /**
     * Parse time string (supports multiple formats)
     */
    private LocalTime parseTime(String timeStr) {
        if (timeStr == null || timeStr.trim().isEmpty()) {
            throw new BaseException(ErrorCode.INVALID_INPUT, "Time cannot be empty");
        }

        timeStr = timeStr.trim();

        try {
            // Try HH:mm format (24-hour)
            return LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("HH:mm"));
        } catch (Exception e1) {
            try {
                // Try h:mm a format (12-hour with AM/PM)
                return LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH));
            } catch (Exception e2) {
                try {
                    // Try hh:mm a format
                    return LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH));
                } catch (Exception e3) {
                    throw new BaseException(ErrorCode.INVALID_INPUT,
                            "Invalid time format: " + timeStr + ". Use HH:mm or h:mm AM/PM");
                }
            }
        }
    }
}