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

    @Column(name = "schedule_id", nullable = false)
    private Long scheduleId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "medication_id", nullable = false)
    private Long medicationId;

    @Column(name = "administered_at", nullable = false)
    private LocalDateTime administeredAt;

    @Column(name = "administered_by", nullable = false)
    private Long administeredBy;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "notes", length = 500)
    private String notes;
    @Column(name = "proof_image_url", length = 500)
    private String proofImageUrl;

}
