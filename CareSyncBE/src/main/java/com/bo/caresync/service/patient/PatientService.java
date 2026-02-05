package com.bo.caresync.service.patient;

import com.bo.caresync.constant.AppConstants;
import com.bo.caresync.dto.request.patient.CreatePatientRequest;
import com.bo.caresync.dto.request.patient.UpdatePatientRequest;
import com.bo.caresync.dto.response.patient.PatientResponse;
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

    @Transactional
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

    @Transactional(readOnly = true)
    public PatientResponse getPatient(Long patientId) {
        String methodName = "getPatient";

        // Check permission
        loginUserUtil.requirePermission(patientId, AppConstants.Permission.PATIENT_VIEW);

        Patient patient = patientRepository.findByPatientIdAndRecordStatus(
                        patientId,
                        AppConstants.RecordStatus.ACTIVE
                )
                .orElseThrow(() -> new BaseException(ErrorCode.PATIENT_NOT_FOUND));

        log.info("{} Patient retrieved: patientId={}", methodName, patientId);
        return toResponse(patient);
    }

    @Transactional(readOnly = true)
    public List<PatientResponse> getMyPatients() {
        String methodName = AppUtil.getMethodName();
        Long currentUserId = loginUserUtil.getCurrentUserId();

        List<Long> patientIds = patientCaregiverRepo.findByCaregiverUserIdAndRecordStatus(
                        currentUserId, AppConstants.RecordStatus.ACTIVE)
                .stream()
                .map(PatientCaregiver::getPatientId)
                .collect(Collectors.toList());

        List<Patient> patients = patientRepository.findAllById(patientIds);

        log.info("{} Retrieved {} patients for user {}", methodName, patients.size(), currentUserId);

        return patients.stream()
                .filter(p -> AppConstants.RecordStatus.ACTIVE.equals(p.getRecordStatus()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PatientResponse updatePatient(Long patientId, UpdatePatientRequest request) {
        String methodName = AppUtil.getMethodName();

        // Check permission
        loginUserUtil.requirePermission(patientId, AppConstants.Permission.PATIENT_EDIT);

        Patient patient = patientRepository.findByPatientIdAndRecordStatus(
                        patientId,
                        AppConstants.RecordStatus.ACTIVE
                )
                .orElseThrow(() -> new BaseException(ErrorCode.PATIENT_NOT_FOUND));

        // Update fields
        patient.setFullName(request.getFullName());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setPhoneNumber(request.getPhoneNumber());
        patient.setAddress(request.getAddress());
        patient.setEmergencyContactName(request.getEmergencyContactName());
        patient.setEmergencyContactPhone(request.getEmergencyContactPhone());

        Patient saved = patientRepository.save(patient);

        log.info("{} Patient updated: patientId={}", methodName, patientId);
        return toResponse(saved);
    }




    private PatientResponse toResponse(Patient patient) {
        PatientResponse response = new PatientResponse();
        response.setPatientId(patient.getPatientId());
        response.setFullName(patient.getFullName());
        response.setDateOfBirth(patient.getDateOfBirth());
        response.setAge(calculateAge(patient.getDateOfBirth()));
        response.setGender(patient.getGender());
        response.setPhoneNumber(patient.getPhoneNumber());
        response.setAddress(patient.getAddress());
        response.setEmergencyContactName(patient.getEmergencyContactName());
        response.setEmergencyContactPhone(patient.getEmergencyContactPhone());
        response.setProfileImageUrl(patient.getProfileImageUrl());
        return response;
    }

    private Integer calculateAge(LocalDate birthDate) {
        if (birthDate == null) return null;
            return Period.between(birthDate, LocalDate.now()).getYears();

    }




}
