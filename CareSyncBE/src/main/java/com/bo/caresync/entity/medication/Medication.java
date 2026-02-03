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

    @Column(name = "name")
    private String name;

    @Column(name = "dosage_form")
    private String dosageForm;

    @Column(name = "strength")
    private String strength;

    @Column(name = "description")
    private String description;

    @Column(name = "common_side_effects")
    private String commonSideEffects;

    @Column(name = "warnings")
    private String warnings;
}
