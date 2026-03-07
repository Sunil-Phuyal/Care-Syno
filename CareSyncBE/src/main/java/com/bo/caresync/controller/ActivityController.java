package com.bo.caresync.controller;

import com.bo.caresync.dto.request.activity.ActivityDTO;
import com.bo.caresync.service.activity.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 3/7/2026, 10:53 PM,
 **/
@RestController
@RequestMapping("/api/v1/activity")
@RequiredArgsConstructor
public class ActivityController extends BaseController {

    private final ActivityService activityService;

    @GetMapping("/recent")
    public ResponseEntity<?> getRecentActivity(@RequestParam(defaultValue = "20") int limit) {
        List<ActivityDTO> activities = activityService.getRecentActivity(limit);
        return successResponse("Recent activity retrieved successfully", activities);
    }


    @GetMapping
    public ResponseEntity<?> getPatientActivity(@RequestParam Long patientId,
                                                @RequestParam(defaultValue = "50") int limit) {
        List<ActivityDTO> activities = activityService.getPatientActivity(patientId, limit);
        return successResponse("Patient activity retrieved successfully", activities);
    }
}