package com.bo.caresync.entity.medication;

import com.bo.caresync.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/3/2026, 4:50 PM,
 **/
@Getter
@Setter
@Entity
@Table(name = "medications", schema = "medication")
public class Medication extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "medication_id")
    private Long medicationId;

    @Column(name = "medication_name", nullable = false, length = 200)
    private String medicationName;

    @Column(name = "generic_name", length = 200)
    private String genericName;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "dosage_form", length = 50)
    private String dosageForm;

    @Column(name = "strength", length = 50)
    private String strength;

    @Column(name = "manufacturer", length = 200)
    private String manufacturer;

    @Column(name = "medication_image_url", length = 500)
    private String medicationImageUrl;
}
