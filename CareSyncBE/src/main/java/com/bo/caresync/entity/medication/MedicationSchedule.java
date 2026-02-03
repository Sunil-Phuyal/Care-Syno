package com.bo.caresync.entity.medication;

import com.bo.caresync.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

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

    @Column(name = "patient_id")
    private Long patientId;

    @Column(name = "medication_id")
    private Long medicationId;

    @Column(name = "dosage")
    private String dosage;

    @Column(name = "frequency")
    private String frequency;

    @Column(name = "time_of_day")
    private String timeOfDay;

    @Column(name = "instructions")
    private String instructions;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;
}