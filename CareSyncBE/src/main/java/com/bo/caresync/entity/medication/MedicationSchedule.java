package com.bo.caresync.entity.medication;

import com.bo.caresync.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/3/2026, 4:51 PM,
 **/
@Getter
@Setter
@Entity
@Table(name = "medication_schedules", schema = "medication")
public class MedicationSchedule extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private Long scheduleId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "medication_id", nullable = false)
    private Long medicationId;

    @Column(name = "dosage", nullable = false, length = 50)
    private String dosage;

    @Column(name = "frequency", nullable = false, length = 50)
    private String frequency;

    @Column(name = "time_of_day", nullable = false)
    private LocalTime timeOfDay;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "special_instructions", length = 500)
    private String specialInstructions;

    @Column(name = "prescription_image_url", length = 500)
    private String prescriptionImageUrl;

    @Column(name = "medication_photo_url", length = 500)
    private String medicationPhotoUrl;
}