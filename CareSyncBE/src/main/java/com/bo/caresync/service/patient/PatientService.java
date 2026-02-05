package com.bo.caresync.service.patient;

import com.bo.caresync.constant.AppConstants;
import com.bo.caresync.dto.request.patient.CreatePatientRequest;
import com.bo.caresync.entity.auth.Role;
import com.bo.caresync.entity.patient.Patient;
import com.bo.caresync.entity.patient.PatientCaregiver;
import com.bo.caresync.enums.ErrorCode;
import com.bo.caresync.exceptions.BaseException;
import com.bo.caresync.repository.PatientCaregiverRepository;
import com.bo.caresync.repository.PatientRepository;
import com.bo.caresync.repository.RoleRepository;
import com.bo.caresync.utils.AppUtil;
import com.bo.caresync.utils.LoginUserUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/5/2026, 5:39 PM,
 **/
@Slf4j
@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final PatientCaregiverRepository patientCaregiverRepo;
    private final RoleRepository roleRepository;
    private final LoginUserUtil loginUserUtil;
    private final String className = this.getClass().getSimpleName();


    public void createPatient(CreatePatientRequest request) {
        String methodName = AppUtil.getMethodName();
        Long currentUserId = loginUserUtil.getCurrentUserId();
        // Create patient
        Patient patient = new Patient();
        patient.setFullName(request.getFullName());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setPhoneNumber(request.getPhoneNumber());
        patient.setAddress(request.getAddress());
        patient.setEmergencyContactName(request.getEmergencyContactName());
        patient.setEmergencyContactPhone(request.getEmergencyContactPhone());
        patient.setRecordStatus(AppConstants.RecordStatus.ACTIVE);

        Patient savedPatient = patientRepository.save(patient);

        Role primaryRole = roleRepository.findByRoleNameAndRecordStatus(
                AppConstants.Role.PRIMARY_CAREGIVER,
                AppConstants.RecordStatus.ACTIVE
        ).orElseThrow(() -> new BaseException(ErrorCode.ROLE_NOT_FOUND));

        PatientCaregiver link = new PatientCaregiver();
        link.setPatientId(savedPatient.getPatientId());
        link.setCaregiverUserId(currentUserId);
        link.setRoleId(primaryRole.getRoleId());
        link.setRelationship("CREATOR");
        link.setRecordStatus(AppConstants.RecordStatus.ACTIVE);

        patientCaregiverRepo.save(link);

        log.info("{} Patient created: patientId={}, createdBy={}",
                methodName, savedPatient.getPatientId(), currentUserId);
    }




}
