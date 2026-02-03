package com.bo.caresync.entity.patient;

import com.bo.caresync.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/3/2026, 4:47 PM,
 **/

@Getter
@Setter
@Entity
@Table(name = "patient_caregivers", schema = "patient")
public class PatientCaregiver extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "patient_caregiver_id")
    private Long patientCaregiverId;

    @Column(name = "patient_id")
    private Long patientId;

    @Column(name = "caregiver_user_id")
    private Long caregiverUserId;

    @Column(name = "role_id")
    private Long roleId;

    @Column(name = "relationship")
    private String relationship;
}