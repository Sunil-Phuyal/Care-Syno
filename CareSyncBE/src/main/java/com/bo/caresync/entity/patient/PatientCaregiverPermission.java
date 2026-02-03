package com.bo.caresync.entity.patient;

import com.bo.caresync.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/3/2026, 4:49 PM,
 **/
@Getter
@Setter
@Entity
@Table(name = "patient_caregiver_permissions", schema = "patient")
public class PatientCaregiverPermission extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pcp_id")
    private Long pcpId;

    @Column(name = "patient_id")
    private Long patientId;

    @Column(name = "caregiver_user_id")
    private Long caregiverUserId;

    @Column(name = "permission_id")
    private Long permissionId;

    @Column(name = "is_granted")
    private Boolean isGranted;

    @Column(name = "granted_by_user_id")
    private Long grantedByUserId;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "notes")
    private String notes;
}