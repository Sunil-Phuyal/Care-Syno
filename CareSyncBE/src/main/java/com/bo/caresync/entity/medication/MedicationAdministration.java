package com.bo.caresync.entity.medication;

import com.bo.caresync.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/3/2026, 4:52 PM,
 **/

@Getter
@Setter
@Entity
@Table(name = "medication_administrations", schema = "medication")
public class MedicationAdministration extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "administration_id")
    private Long administrationId;

    @Column(name = "patient_id")
    private Long patientId;

    @Column(name = "medication_id")
    private Long medicationId;

    @Column(name = "schedule_id")
    private Long scheduleId;

    @Column(name = "caregiver_user_id")
    private Long caregiverUserId;

    @Column(name = "scheduled_time")
    private LocalDateTime scheduledTime;

    @Column(name = "actual_time")
    private LocalDateTime actualTime;

    @Column(name = "dosage_given")
    private String dosageGiven;

    @Column(name = "status")
    private String status;

    @Column(name = "notes")
    private String notes;

    @Column(name = "side_effects")
    private String sideEffects;
}