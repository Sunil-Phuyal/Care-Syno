package com.bo.caresync.dto.request.medication;

import lombok.Getter;
import lombok.Setter;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 3/5/2026, 6:41 PM,
 **/
@Getter
@Setter
public class UpdateScheduleRequest {

    private String dosage;
    private String frequency;
    private String timeOfDay;
    private String instructions;
    private String startDate;
    private String endDate;
}