package com.bo.caresync.dto.request.medication;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 3/22/2026, 1:58 PM,
 **/
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicationDTO {
    private Long medicationId;
    private String medicationName;
    private String genericName;
    private String description;
    private String dosageForm;
    private String strength;
    private String manufacturer;
    private String medicationImageUrl;
    private String addedBy;
    private LocalDateTime addedAt;
}