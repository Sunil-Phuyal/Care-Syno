package com.bo.caresync.dto.response.patient;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/5/2026, 6:09 PM,
 **/
@Getter
@Setter
public class PatientResponse {
    private Long patientId;
    private String fullName;
    private LocalDate dateOfBirth;
    private Integer age;
    private String gender;
    private String phoneNumber;
    private String address;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String profileImageUrl;
}