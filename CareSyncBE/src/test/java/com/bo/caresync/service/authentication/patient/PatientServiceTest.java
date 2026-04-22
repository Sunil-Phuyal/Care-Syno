package com.bo.caresync.service.authentication.patient;

import com.bo.caresync.constant.AppConstants;
import com.bo.caresync.dto.request.patient.CreatePatientRequest;
import com.bo.caresync.dto.request.patient.UpdatePatientRequest;
import com.bo.caresync.dto.response.patient.PatientResponse;
import com.bo.caresync.entity.auth.Role;
import com.bo.caresync.entity.patient.Patient;
import com.bo.caresync.entity.patient.PatientCaregiver;
import com.bo.caresync.exceptions.BaseException;
import com.bo.caresync.repository.PatientCaregiverRepository;
import com.bo.caresync.repository.PatientRepository;
import com.bo.caresync.repository.RoleRepository;
import com.bo.caresync.service.patient.PatientService;
import com.bo.caresync.utils.LoginUserUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 4/14/2026, 10:16 AM,
 **/
@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock private PatientRepository patientRepository;
    @Mock private PatientCaregiverRepository patientCaregiverRepo;
    @Mock private RoleRepository roleRepository;
    @Mock private LoginUserUtil loginUserUtil;

    @InjectMocks
    private PatientService patientService;

    // ===== Helper: Create dummy Patient =====
    private Patient createPatient() {
        Patient patient = new Patient();
        patient.setPatientId(1L);
        patient.setFullName("Ramesh Prasad Shrestha");
        patient.setDateOfBirth(LocalDate.of(1978, 5, 12));
        patient.setGender("Male");
        patient.setPhoneNumber("9841234567");
        patient.setAddress("Baneshwor, Kathmandu");
        patient.setEmergencyContactName("Sunita Shrestha");
        patient.setEmergencyContactPhone("9851234567");
        patient.setRecordStatus(AppConstants.RecordStatus.ACTIVE);
        return patient;
    }

    // ===== Helper: Create dummy Role =====
    private Role createRole() {
        Role role = new Role();
        role.setRoleId(1L);
        role.setRoleName(AppConstants.Role.PRIMARY_CAREGIVER);
        return role;
    }

    // ===== Helper: Create dummy PatientCaregiver =====
    private PatientCaregiver createPatientCaregiver() {
        PatientCaregiver pc = new PatientCaregiver();
        pc.setPatientId(1L);
        pc.setCaregiverUserId(1L);
        pc.setRoleId(1L);
        pc.setRelationship("CREATOR");
        pc.setRecordStatus(AppConstants.RecordStatus.ACTIVE);
        return pc;
    }

    // ===== Helper: Create dummy CreatePatientRequest =====
    private CreatePatientRequest createPatientRequest() {
        CreatePatientRequest request = new CreatePatientRequest();
        request.setFullName("Ramesh Prasad Shrestha");
        request.setDateOfBirth(LocalDate.of(1978, 5, 12));
        request.setGender("Male");
        request.setPhoneNumber("9841234567");
        request.setAddress("Baneshwor, Kathmandu");
        request.setEmergencyContactName("Sunita Shrestha");
        request.setEmergencyContactPhone("9851234567");
        return request;
    }

    // ===================== CREATE PATIENT TESTS =====================

    @Test
    void createPatient_ShouldSuccess_WhenPatientNotExists() {
        // Arrange
        CreatePatientRequest request = createPatientRequest();
        Patient savedPatient = createPatient();
        Role role = createRole();

        when(loginUserUtil.getCurrentUserId()).thenReturn(1L);
        when(patientRepository.findByFullNameAndDateOfBirthAndRecordStatus(
                request.getFullName(),
                request.getDateOfBirth(),
                AppConstants.RecordStatus.ACTIVE
        )).thenReturn(Optional.empty());
        when(patientRepository.save(any(Patient.class))).thenReturn(savedPatient);
        when(roleRepository.findByRoleNameAndRecordStatus(
                AppConstants.Role.PRIMARY_CAREGIVER,
                AppConstants.RecordStatus.ACTIVE
        )).thenReturn(Optional.of(role));

        // Act
        patientService.createPatient(request);

        // Assert
        verify(patientRepository).save(any(Patient.class));
        verify(patientCaregiverRepo).save(any(PatientCaregiver.class));
    }

    @Test
    void createPatient_ShouldThrowException_WhenPatientAlreadyExists() {
        // Arrange
        CreatePatientRequest request = createPatientRequest();
        Patient existingPatient = createPatient();

        when(loginUserUtil.getCurrentUserId()).thenReturn(1L);
        when(patientRepository.findByFullNameAndDateOfBirthAndRecordStatus(
                request.getFullName(),
                request.getDateOfBirth(),
                AppConstants.RecordStatus.ACTIVE
        )).thenReturn(Optional.of(existingPatient));

        // Act & Assert
        assertThrows(BaseException.class, () -> patientService.createPatient(request));
        verify(patientRepository, never()).save(any(Patient.class));
    }

    // ===================== GET PATIENT TESTS =====================

    @Test
    void getPatient_ShouldReturnPatient_WhenPatientExists() {
        Patient patient = createPatient();

        doNothing().when(loginUserUtil).requirePermission(1L, AppConstants.Permission.PATIENT_VIEW);
        when(patientRepository.findByPatientIdAndRecordStatus(
                1L,
                AppConstants.RecordStatus.ACTIVE
        )).thenReturn(Optional.of(patient));
        PatientResponse response = patientService.getPatient(1L);

        // Assert
        assertNotNull(response);
        assertEquals("Ramesh Prasad Shrestha", response.getFullName());
    }

    // ===================== GET MY PATIENTS TESTS =====================

    @Test
    void getMyPatients_ShouldReturnPatients_WhenPatientsExist() {
        // Arrange
        Patient patient = createPatient();
        PatientCaregiver pc = createPatientCaregiver();

        when(loginUserUtil.getCurrentUserId()).thenReturn(1L);
        when(patientCaregiverRepo.findByCaregiverUserIdAndRecordStatus(
                1L,
                AppConstants.RecordStatus.ACTIVE
        )).thenReturn(List.of(pc));
        when(patientRepository.findAllById(List.of(1L))).thenReturn(List.of(patient));

        // Act
        List<PatientResponse> responses = patientService.getMyPatients();

        // Assert
        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals("Ramesh Prasad Shrestha", responses.get(0).getFullName());
    }

    // ===================== UPDATE PATIENT TESTS =====================

    @Test
    void updatePatient_ShouldSuccess_WhenPatientExists() {
        // Arrange
        UpdatePatientRequest request = new UpdatePatientRequest();
        request.setFullName("Ramesh Prasad Shrestha");
        request.setDateOfBirth(LocalDate.of(1978, 5, 12));
        request.setGender("Male");
        request.setPhoneNumber("9841234567");
        request.setAddress("Lazimpat, Kathmandu");
        request.setEmergencyContactName("Sunita Shrestha");
        request.setEmergencyContactPhone("9851234567");

        Patient patient = createPatient();

        doNothing().when(loginUserUtil).requirePermission(1L, AppConstants.Permission.PATIENT_EDIT);
        when(patientRepository.findByPatientIdAndRecordStatus(
                1L,
                AppConstants.RecordStatus.ACTIVE
        )).thenReturn(Optional.of(patient));
        when(patientRepository.save(any(Patient.class))).thenReturn(patient);
        PatientResponse response = patientService.updatePatient(1L, request);
        assertNotNull(response);
        verify(patientRepository).save(any(Patient.class));
    }

    // ===================== DELETE PATIENT TESTS =====================

    @Test
    void deletePatient_ShouldSuccess_WhenPatientExists() {
        // Arrange
        Patient patient = createPatient();

        doNothing().when(loginUserUtil).requirePermission(1L, AppConstants.Permission.PATIENT_DELETE);
        when(patientRepository.findByPatientIdAndRecordStatus(
                1L,
                AppConstants.RecordStatus.ACTIVE
        )).thenReturn(Optional.of(patient));
        when(loginUserUtil.getCurrentUserEmail()).thenReturn("ramesh.shrestha@gmail.com");
        when(patientRepository.save(any(Patient.class))).thenReturn(patient);
        patientService.deletePatient(1L);
        verify(patientRepository).save(any(Patient.class));
        assertEquals(AppConstants.RecordStatus.INACTIVE, patient.getRecordStatus());
        assertEquals("ramesh.shrestha@gmail.com", patient.getDeletedBy());
    }
}