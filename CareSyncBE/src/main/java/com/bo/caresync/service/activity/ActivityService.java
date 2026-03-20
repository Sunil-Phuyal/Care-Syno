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
import com.bo.caresync.utils.AppUtil;
import com.bo.caresync.utils.LoginUserUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Service for activity feed/timeline
 * Shows recent medication administration activities
 *
 * @author Sunil Phuyal
 * @version 1.0
 * @project CareSyncBE
 * @since 2/10/2026
 */
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
        String methodName = AppUtil.getMethodName();

        Long currentUserId = loginUserUtil.getCurrentUserId();

        log.debug("{} Getting recent activity for userId={}, limit={}",
                methodName, currentUserId, limit);

        List<PatientCaregiver> caregiverLinks = caregiverRepo
                .findByCaregiverUserIdAndRecordStatus(currentUserId, "Y");

        List<ActivityDTO> activities = new ArrayList<>();

        for (PatientCaregiver link : caregiverLinks) {
            List<MedicationAdministration> administrations = administrationRepo
                    .findByPatientIdAndRecordStatusOrderByAdministeredAtDesc(
                            link.getPatientId(),
                            "Y"
                    );
            int count = 0;
            for (MedicationAdministration admin : administrations) {
                if (count >= 10) break;
                activities.add(toActivityDTO(admin, link.getPatientId()));
                count++;
            }
        }
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
        loginUserUtil.requirePermission(patientId, "medication.view_history");

        List<ActivityDTO> activities = new ArrayList<>();
        List<MedicationAdministration> administrations = administrationRepo
                .findByPatientIdAndRecordStatusOrderByAdministeredAtDesc(
                        patientId,
                        "Y"
                );
        int count = 0;
        for (MedicationAdministration admin : administrations) {
            if (count >= limit) break;
            activities.add(toActivityDTO(admin, patientId));
            count++;
        }

        log.info("{} Returning {} activities for patient", methodName, activities.size());

        return activities;
    }
    private ActivityDTO toActivityDTO(MedicationAdministration admin, Long patientId) {
        String patientName = patientRepo.findById(patientId)
                .map(Patient::getFullName)
                .orElse("Unknown Patient");
        Optional<User> caregiverOpt = userRepo.findById(admin.getAdministeredBy());
        String caregiverName = caregiverOpt.map(User::getFullName).orElse("Unknown");
        String caregiverEmail = caregiverOpt.map(User::getEmail).orElse("");
        String icon = "💊";
        String color = "info";

        if (admin.getStatus() != null) {
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
        }
        String description = String.format(
                "%s medication for %s",
                admin.getStatus() != null ? admin.getStatus() : "Logged",
                patientName
        );
        if (admin.getNotes() != null && !admin.getNotes().isEmpty()) {
            description += " - " + admin.getNotes();
        }
        return ActivityDTO.builder()
                .activityId(admin.getAdministrationId())
                .activityType("MEDICATION_" + (admin.getStatus() != null ? admin.getStatus() : "LOGGED"))
                .description(description)
                .performedByName(caregiverName)
                .performedByEmail(caregiverEmail)
                .patientName(patientName)
                .patientId(patientId)
                .timestamp(admin.getAdministeredAt())
                .icon(icon)
                .color(color)
                .build();
    }
}