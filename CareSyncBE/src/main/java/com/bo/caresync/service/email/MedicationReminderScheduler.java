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
    private final MedicationRepository medicationRepo;  // ← ADD THIS
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;
    private final PermissionService permissionService;

    private final Set<String> sentReminders = new HashSet<>();

    /**
     * Run every 5 minutes: 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55
     * Checks for medications due in the next 30 minutes
     */
    @Scheduled(cron = "0 */5 * * * *")
    public void sendMedicationReminders() {
        String methodName = "sendMedicationReminders";
        log.info("{} Starting medication reminder check...", methodName);

        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime in30Min = now.plusMinutes(30);

            // Get all active schedules
            List<MedicationSchedule> schedules = scheduleRepo.findByRecordStatus("Y");

            int remindersSent = 0;

            for (MedicationSchedule schedule : schedules) {
                try {
                    remindersSent += processSchedule(schedule, now, in30Min);
                } catch (Exception e) {
                    log.error("{} Error processing schedule {}: {}",
                            methodName, schedule.getScheduleId(), e.getMessage());
                }
            }

            log.info("{} Completed. Sent {} reminders", methodName, remindersSent);

            // Clear old sent reminders (older than 1 hour)
            cleanupSentReminders();

        } catch (Exception e) {
            log.error("{} Error in medication reminder scheduler: {}", methodName, e.getMessage(), e);
        }
    }
    private int processSchedule(MedicationSchedule schedule, LocalDateTime now, LocalDateTime in30Min) {
        if (schedule.getTimeOfDay() == null) {
            return 0;
        }

        int remindersSent = 0;
        LocalTime time = schedule.getTimeOfDay();
        LocalDateTime scheduledDateTime = LocalDate.now().atTime(time);
        if (scheduledDateTime.isBefore(now)) {
            return 0;
        }
        if (scheduledDateTime.isAfter(now) && scheduledDateTime.isBefore(in30Min)) {
            boolean alreadyAdministered = administrationRepo
                    .existsByScheduleIdAndAdministeredAtBetween(
                            schedule.getScheduleId(),
                            scheduledDateTime.minusMinutes(30),
                            scheduledDateTime.plusMinutes(30)
                    );

            if (!alreadyAdministered) {
                String reminderKey = String.format("%d-%s",
                        schedule.getScheduleId(),
                        scheduledDateTime.toString());

                if (!sentReminders.contains(reminderKey)) {
                    sendReminderEmails(schedule, scheduledDateTime);
                    sentReminders.add(reminderKey);
                    remindersSent++;
                }
            }
        }

        return remindersSent;
    }
    private void sendReminderEmails(MedicationSchedule schedule, LocalDateTime scheduledTime) {
        String methodName = AppUtil.getMethodName();
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

        long minutesUntil = Duration.between(LocalDateTime.now(), scheduledTime).toMinutes();

        for (PatientCaregiver caregiver : caregivers) {
            try {
                boolean canAdminister = permissionService.hasPermission(
                        caregiver.getCaregiverUserId(),
                        "medication.administer",
                        schedule.getPatientId()
                );

                if (!canAdminister) {
                    log.debug("{} Caregiver {} does not have administer permission, skipping",
                            methodName, caregiver.getCaregiverUserId());
                    continue;
                }
                Optional<User> userOpt = userRepo.findById(caregiver.getCaregiverUserId());
                if (userOpt.isEmpty()) {
                    log.warn("{} User not found: {}", methodName, caregiver.getCaregiverUserId());
                    continue;
                }
                User user = userOpt.get();
                String subject = String.format("⏰ Medication Reminder: %s - %s",
                        patient.getFullName(),
                        medication.getMedicationName());
                String body = emailTemplateService.getMedicationReminderBody(
                        user.getFullName(),
                        patient.getFullName(),
                        medication.getMedicationName(),
                        schedule.getDosage(),
                        scheduledTime,
                        (int) minutesUntil,
                        schedule.getSpecialInstructions()
                );

                emailService.sendSimpleEmail(user.getEmail(), subject, body);

                log.info("{} Sent reminder to {} for patient {} - medication {}",
                        methodName, user.getEmail(), patient.getFullName(), medication.getMedicationName());

            } catch (Exception e) {
                log.error("{} Failed to send reminder to caregiver {}: {}",
                        methodName, caregiver.getCaregiverUserId(), e.getMessage());
            }
        }
    }
    private void cleanupSentReminders() {
        if (sentReminders.size() > 1000) {
            sentReminders.clear();
            log.info("Cleared sent reminders cache");
        }
    }
}