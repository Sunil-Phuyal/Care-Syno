package com.bo.caresync.dto.request.medication;

import lombok.Getter;
import lombok.Setter;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 4/20/2026, 6:10 PM,
 **/
@Getter
@Setter
public class UpdateMedicationRequest {
    private String medicationName;
    private String genericName;
    private String description;
    private String dosageForm;
    private String strength;
    private String manufacturer;
    private String medicationImageUrl;
}
