package com.bo.caresync.service.activity;

import com.bo.caresync.dto.request.activity.ActivityDTO;
import com.bo.caresync.entity.medication.MedicationAdministration;
import com.bo.caresync.entity.patient.Patient;
import com.bo.caresync.entity.patient.PatientCaregiver;
import com.bo.caresync.entity.user.User;
import com.bo.caresync.repository.MedicationAdministrationRepository;
import com.bo.caresync.repository.PatientCaregiverRepository;
import com.bo.caresync.repository.PatientRepository;
import com.bo.caresync.repository.UserRepository;
import com.bo.caresync.utils.LoginUserUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 3/7/2026, 10:18 PM,
 **/
@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityService {

    private final MedicationAdministrationRepository administrationRepo;
    private final PatientCaregiverRepository caregiverRepo;
    private final PatientRepository patientRepo;
    private final UserRepository userRepo;
    private final LoginUserUtil loginUserUtil;

    @Transactional(readOnly = true)
    public List<ActivityDTO> getRecentActivity(int limit) {
        String methodName = "getRecentActivity";

        Long currentUserId = loginUserUtil.getCurrentUserId();

        log.debug("{} Getting recent activity for userId={}, limit={}",
                methodName, currentUserId, limit);

        // Get all patients this user has access to
        List<PatientCaregiver> caregiverLinks = caregiverRepo
                .findByCaregiverUserIdAndRecordStatus(currentUserId, "Y");

        List<ActivityDTO> activities = new ArrayList<>();

        // Get recent medication administrations
        for (PatientCaregiver link : caregiverLinks) {
            List<MedicationAdministration> administrations = administrationRepo
                    .findByPatientIdAndRecordStatusOrderByActualTimeDesc(
                            link.getPatientId(),
                            "Y",
                            PageRequest.of(0, 10)
                    );

            for (MedicationAdministration admin : administrations) {
                activities.add(toActivityDTO(admin, link.getPatientId()));
            }
        }

        // Sort by timestamp and limit
        activities.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));

        if (activities.size() > limit) {
            activities = activities.subList(0, limit);
        }

        log.info("{} Returning {} recent activities", methodName, activities.size());

        return activities;
    }
    @Transactional(readOnly = true)
    public List<ActivityDTO> getPatientActivity(Long patientId, int limit) {
        String methodName = "getPatientActivity";

        log.debug("{} Getting activity for patientId={}, limit={}",
                methodName, patientId, limit);

        // Check user has access to this patient
        loginUserUtil.requirePatientAccess(patientId);

        List<ActivityDTO> activities = new ArrayList<>();

        // Get medication administrations
        List<MedicationAdministration> administrations = administrationRepo
                .findByPatientIdAndRecordStatusOrderByActualTimeDesc(
                        patientId,
                        "Y",
                        PageRequest.of(0, limit)
                );

        for (MedicationAdministration admin : administrations) {
            activities.add(toActivityDTO(admin, patientId));
        }

        log.info("{} Returning {} activities for patient", methodName, activities.size());

        return activities;
    }

    private ActivityDTO toActivityDTO(MedicationAdministration admin, Long patientId) {

        // Get patient name
        String patientName = patientRepo.findById(patientId)
                .map(Patient::getFullName)
                .orElse("Unknown Patient");

        // Get caregiver name
        Optional<User> caregiverOpt = userRepo.findById(admin.getCaregiverUserId());
        String caregiverName = caregiverOpt.map(User::getFullName).orElse("Unknown");
        String caregiverEmail = caregiverOpt.map(User::getEmail).orElse("");

        // Determine icon and color based on status
        String icon = "💊";
        String color = "info";

        switch (admin.getStatus()) {
            case "ADMINISTERED":
                icon = "✅";
                color = "success";
                break;
            case "SKIPPED":
                icon = "⏭️";
                color = "warning";
                break;
            case "MISSED":
                icon = "❌";
                color = "error";
                break;
            case "REFUSED":
                icon = "🚫";
                color = "error";
                break;
        }

        String description = String.format(
                "%s medication for %s - %s",
                admin.getStatus(),
                patientName,
                admin.getDosageGiven()
        );

        return ActivityDTO.builder()
                .activityId(admin.getAdministrationId())
                .activityType("MEDICATION_" + admin.getStatus())
                .description(description)
                .performedByName(caregiverName)
                .performedByEmail(caregiverEmail)
                .patientName(patientName)
                .patientId(patientId)
                .timestamp(admin.getActualTime())
                .icon(icon)
                .color(color)
                .build();
    }
}