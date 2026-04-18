package com.bo.caresync.service.email;

import com.bo.caresync.entity.medication.Medication;
import com.bo.caresync.entity.medication.MedicationSchedule;
import com.bo.caresync.entity.patient.Patient;
import com.bo.caresync.entity.patient.PatientCaregiver;
import com.bo.caresync.entity.user.User;
import com.bo.caresync.repository.*;
import com.bo.caresync.service.permession.PermissionService;
import com.bo.caresync.utils.AppUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 3/5/2026, 4:20 PM,
 **/
@Slf4j
@Component
@RequiredArgsConstructor
public class MedicationReminderScheduler {

    private final MedicationScheduleRepository scheduleRepo;
    private final MedicationAdministrationRepository administrationRepo;
    private final PatientCaregiverRepository caregiverRepo;
    private final PatientRepository patientRepo;
    private final UserRepository userRepo;
    private final MedicationRepository medicationRepo;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;
    private final PermissionService permissionService;

    private static final String WINDOW_30  = "30MIN";
    private static final String WINDOW_5   = "5MIN";
    private static final String WINDOW_NOW = "NOW";

    private final Set<String> sentReminders = new HashSet<>();

    @Scheduled(cron = "0 * 0/5 * * *")
    public void sendMedicationReminders() {
        String methodName = "sendMedicationReminders";
        log.info("{} Starting medication reminder check...", methodName);

        try {
            LocalDateTime now = LocalDateTime.now();

            List<MedicationSchedule> schedules = scheduleRepo.findByRecordStatus("Y");

            int remindersSent = 0;

            for (MedicationSchedule schedule : schedules) {
                try {
                    remindersSent += processSchedule(schedule, now);
                } catch (Exception e) {
                    log.error("{} Error processing schedule {}: {}",
                            methodName, schedule.getScheduleId(), e.getMessage());
                }
            }

            log.info("{} Completed. Sent {} reminders.", methodName, remindersSent);
            cleanupSentReminders();

        } catch (Exception e) {
            log.error("{} Fatal error in reminder scheduler: {}", methodName, e.getMessage(), e);
        }
    }

    private int processSchedule(MedicationSchedule schedule, LocalDateTime now) {
        if (schedule.getTimeOfDay() == null) {
            return 0;
        }

        LocalDateTime scheduledDateTime = LocalDate.now().atTime(schedule.getTimeOfDay());
        if (scheduledDateTime.isBefore(now.minusMinutes(2))) {
            return 0;
        }
        long minutesUntil = Duration.between(now, scheduledDateTime).toMinutes();

        int remindersSent = 0;
        if (minutesUntil >= 25 && minutesUntil <= 30) {
            remindersSent += maybeSendReminder(schedule, scheduledDateTime, WINDOW_30, (int) minutesUntil);
        }
        if (minutesUntil >= 3 && minutesUntil <= 5) {
            remindersSent += maybeSendReminder(schedule, scheduledDateTime, WINDOW_5, (int) minutesUntil);
        }
        if (minutesUntil >= -2 && minutesUntil <= 2) {
            remindersSent += maybeSendReminder(schedule, scheduledDateTime, WINDOW_NOW, (int) minutesUntil);
        }

        return remindersSent;
    }

    private int maybeSendReminder(
            MedicationSchedule schedule,
            LocalDateTime scheduledDateTime,
            String windowKey,
            int minutesUntil
    ) {
        // 1. Was the medication already administered in this window? (±30 min)
        boolean alreadyAdministered = administrationRepo
                .existsByScheduleIdAndAdministeredAtBetween(
                        schedule.getScheduleId(),
                        scheduledDateTime.minusMinutes(30),
                        scheduledDateTime.plusMinutes(30)
                );

        if (alreadyAdministered) {
            log.debug("Schedule {} already administered — skipping {} reminder",
                    schedule.getScheduleId(), windowKey);
            return 0;
        }

        // 2. Did we already send THIS window's reminder?
        //    Key format: "{scheduleId}-{scheduledDateTime}-{WINDOW}"
        String reminderKey = String.format("%d-%s-%s",
                schedule.getScheduleId(),
                scheduledDateTime.toString(),
                windowKey);

        if (sentReminders.contains(reminderKey)) {
            return 0;
        }

        // 3. All clear — send it and record the key
        sendReminderEmails(schedule, scheduledDateTime, minutesUntil, windowKey);
        sentReminders.add(reminderKey);
        return 1;
    }

    // ─────────────────────────────────────────────────────────────
    // Email dispatch — finds eligible caregivers and sends
    // ─────────────────────────────────────────────────────────────
    private void sendReminderEmails(
            MedicationSchedule schedule,
            LocalDateTime scheduledTime,
            int minutesUntil,
            String windowKey
    ) {
        String methodName = "sendReminderEmails";

        Optional<Patient> patientOpt = patientRepo.findById(schedule.getPatientId());
        if (patientOpt.isEmpty()) {
            log.warn("{} Patient not found: {}", methodName, schedule.getPatientId());
            return;
        }
        Patient patient = patientOpt.get();

        Optional<Medication> medicationOpt = medicationRepo.findById(schedule.getMedicationId());
        if (medicationOpt.isEmpty()) {
            log.warn("{} Medication not found: {}", methodName, schedule.getMedicationId());
            return;
        }
        Medication medication = medicationOpt.get();

        List<PatientCaregiver> caregivers = caregiverRepo
                .findByPatientIdAndRecordStatus(schedule.getPatientId(), "Y");

        for (PatientCaregiver caregiver : caregivers) {
            try {
                // Only caregivers with administer permission get reminders
                boolean canAdminister = permissionService.hasPermission(
                        caregiver.getCaregiverUserId(),
                        "medication.administer",
                        schedule.getPatientId()
                );

                if (!canAdminister) {
                    log.debug("{} Caregiver {} lacks administer permission — skipping",
                            methodName, caregiver.getCaregiverUserId());
                    continue;
                }

                Optional<User> userOpt = userRepo.findById(caregiver.getCaregiverUserId());
                if (userOpt.isEmpty()) {
                    log.warn("{} User not found: {}", methodName, caregiver.getCaregiverUserId());
                    continue;
                }
                User user = userOpt.get();

                // Build subject and body depending on which window fired
                String subject = buildSubject(windowKey, patient.getFullName(), medication.getMedicationName());
                String body = emailTemplateService.getMedicationReminderBody(
                        user.getFullName(),
                        patient.getFullName(),
                        medication.getMedicationName(),
                        schedule.getDosage(),
                        scheduledTime,
                        minutesUntil,
                        schedule.getSpecialInstructions(),
                        windowKey
                );

                emailService.sendSimpleEmail(user.getEmail(), subject, body);

                log.info("{} [{}] Sent reminder → {} | patient: {} | medication: {}",
                        methodName, windowKey,
                        user.getEmail(),
                        patient.getFullName(),
                        medication.getMedicationName());

            } catch (Exception e) {
                log.error("{} Failed to send reminder to caregiver {}: {}",
                        methodName, caregiver.getCaregiverUserId(), e.getMessage());
            }
        }
    }

    /**
     * Builds the email subject line based on which window fired.
     *
     * 30MIN → "⏰ Medication Reminder (30 min): John - Paracetamol"
     * 5MIN  → "⚡ Medication Due Soon (5 min): John - Paracetamol"
     * NOW   → "🔴 Give Medication NOW: John - Paracetamol"
     */
    private String buildSubject(String windowKey, String patientName, String medicationName) {
        return switch (windowKey) {
            case WINDOW_30 -> String.format(
                    "⏰ Medication Reminder (30 min): %s - %s", patientName, medicationName);
            case WINDOW_5  -> String.format(
                    "⚡ Medication Due Soon (5 min): %s - %s",  patientName, medicationName);
            case WINDOW_NOW -> String.format(
                    "🔴 Give Medication NOW: %s - %s",           patientName, medicationName);
            default -> String.format(
                    "⏰ Medication Reminder: %s - %s",           patientName, medicationName);
        };
    }

    private void cleanupSentReminders() {
        if (sentReminders.size() > 3000) {
            sentReminders.clear();
            log.info("Cleared sent reminders cache (threshold reached)");
        }
    }
}