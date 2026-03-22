package com.bo.caresync.dto.request.patient;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/5/2026, 6:02 PM,
 **/
@Getter
@Setter
public class UpdatePatientRequest {
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String phoneNumber;
    private String address;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String profileImageUrl;
}