package com.bo.caresync.service.authentication.medication;

import com.bo.caresync.constant.AppConstants;
import com.bo.caresync.dto.request.medication.*;
import com.bo.caresync.entity.auth.Role;
import com.bo.caresync.entity.medication.Medication;
import com.bo.caresync.entity.medication.MedicationAdministration;
import com.bo.caresync.entity.medication.MedicationSchedule;
import com.bo.caresync.entity.patient.Patient;
import com.bo.caresync.entity.patient.PatientCaregiver;
import com.bo.caresync.entity.user.User;
import com.bo.caresync.exceptions.BaseException;
import com.bo.caresync.repository.*;
import com.bo.caresync.service.email.EmailService;
import com.bo.caresync.service.email.EmailTemplateService;
import com.bo.caresync.service.medication.MedicationService;
import com.bo.caresync.utils.LoginUserUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 4/14/2026, 2:17 PM,
 **/
@ExtendWith(MockitoExtension.class)
class MedicationServiceTest {

    @Mock private MedicationRepository medicationRepo;
    @Mock private MedicationScheduleRepository scheduleRepo;
    @Mock private MedicationAdministrationRepository administrationRepo;
    @Mock private PatientRepository patientRepo;
    @Mock private PatientCaregiverRepository patientCaregiverRepo;
    @Mock private UserRepository userRepo;
    @Mock private RoleRepository roleRepo;
    @Mock private LoginUserUtil loginUserUtil;
    @Mock private EmailService emailService;
    @Mock private EmailTemplateService emailTemplateService;

    @InjectMocks
    private MedicationService medicationService;

    // ===== Helper: Create dummy Medication =====
    private Medication createMedication() {
        Medication medication = new Medication();
        medication.setMedicationId(1L);
        medication.setMedicationName("Paracetamol");
        medication.setGenericName("Acetaminophen");
        medication.setDescription("Pain reliever and fever reducer");
        medication.setRecordStatus(AppConstants.RecordStatus.ACTIVE);
        return medication;
    }

    // ===== Helper: Create dummy MedicationSchedule =====
    private MedicationSchedule createSchedule() {
        MedicationSchedule schedule = new MedicationSchedule();
        schedule.setScheduleId(1L);
        schedule.setPatientId(1L);
        schedule.setMedicationId(1L);
        schedule.setDosage("500mg");
        schedule.setFrequency("Twice daily");
        schedule.setTimeOfDay(LocalTime.of(8, 0));
        schedule.setStartDate(LocalDate.of(2026, 1, 1));
        schedule.setEndDate(LocalDate.of(2026, 6, 30));
        schedule.setRecordStatus(AppConstants.RecordStatus.ACTIVE);
        return schedule;
    }

    // ===== Helper: Create dummy Patient =====
    private Patient createPatient() {
        Patient patient = new Patient();
        patient.setPatientId(1L);
        patient.setFullName("Ramesh Prasad Shrestha");
        patient.setDateOfBirth(LocalDate.of(1978, 5, 12));
        patient.setGender("Male");
        patient.setPhoneNumber("9841234567");
        patient.setAddress("Baneshwor, Kathmandu");
        patient.setRecordStatus(AppConstants.RecordStatus.ACTIVE);
        return patient;
    }

    // ===== Helper: Create dummy User =====
    private User createUser() {
        User user = new User();
        user.setUserId(1L);
        user.setEmail("bibek.karki@gmail.com");
        user.setFullName("Bibek Karki");
        user.setRecordStatus(AppConstants.RecordStatus.ACTIVE);
        return user;
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
        pc.setRecordStatus(AppConstants.RecordStatus.ACTIVE);
        return pc;
    }

    // ===== Helper: Create dummy MedicationAdministration =====
    private MedicationAdministration createAdministration() {
        MedicationAdministration admin = new MedicationAdministration();
        admin.setAdministrationId(1L);
        admin.setScheduleId(1L);
        admin.setPatientId(1L);
        admin.setMedicationId(1L);
        admin.setAdministeredAt(LocalDateTime.now());
        admin.setAdministeredBy(1L);
        admin.setStatus("GIVEN");
        admin.setNotes("Given after breakfast");
        admin.setRecordStatus(AppConstants.RecordStatus.ACTIVE);
        return admin;
    }

    // ===================== CREATE MEDICATION TESTS =====================

    @Test
    void createMedication_ShouldSuccess_WhenMedicationNotExists() {
        // Arrange
        CreateMedicationRequest request = new CreateMedicationRequest();
        request.setMedicationName("paracetamol");
        request.setGenericName("acetaminophen");
        request.setDescription("Pain reliever and fever reducer");

        Medication savedMedication = createMedication();
        PatientCaregiver pc = createPatientCaregiver();
        Role role = createRole();

        when(loginUserUtil.getCurrentUserId()).thenReturn(1L);
        when(patientCaregiverRepo.findByCaregiverUserIdAndRecordStatus(
                1L, AppConstants.RecordStatus.ACTIVE
        )).thenReturn(List.of(pc));
        when(roleRepo.findById(1L)).thenReturn(Optional.of(role));
        when(medicationRepo.findByMedicationNameIgnoreCase("Paracetamol"))
                .thenReturn(Optional.empty());
        when(loginUserUtil.getCurrentUserEmail()).thenReturn("bibek.karki@gmail.com");
        when(medicationRepo.save(any(Medication.class))).thenReturn(savedMedication);

        // Act
        MedicationDTO response = medicationService.createMedication(request);

        // Assert
        assertNotNull(response);
        assertEquals("Paracetamol", response.getMedicationName());
        verify(medicationRepo).save(any(Medication.class));
    }

    // ===================== CREATE MEDICATION SCHEDULE TESTS =====================

    @Test
    void createMedicationSchedule_ShouldSuccess_WhenValidRequest() {
        // Arrange
        CreateMedicationScheduleRequest request = new CreateMedicationScheduleRequest();
        request.setPatientId(1L);
        request.setMedicationId(1L);
        request.setDosage("500mg");
        request.setFrequency("Twice daily");
        request.setTimes(List.of("08:00"));
        request.setStartDate(LocalDate.of(2026, 1, 1));
        request.setEndDate(LocalDate.of(2026, 6, 30));
        request.setSpecialInstructions("Take after meals");

        Medication medication = createMedication();
        Patient patient = createPatient();
        MedicationSchedule savedSchedule = createSchedule();

        doNothing().when(loginUserUtil).requirePermission(1L, "medication.create_schedule");
        when(medicationRepo.findById(1L)).thenReturn(Optional.of(medication));
        when(patientRepo.findById(1L)).thenReturn(Optional.of(patient));
        when(scheduleRepo.saveAll(anyList())).thenReturn(List.of(savedSchedule));

        // Act
        MedicationScheduleResponse response = medicationService.createMedicationSchedule(request);

        // Assert
        assertNotNull(response);
        verify(scheduleRepo).saveAll(anyList());
    }

    // ===================== GET PATIENT SCHEDULES TESTS =====================

    @Test
    void getPatientSchedules_ShouldReturnSchedules_WhenSchedulesExist() {
        // Arrange
        Medication medication = createMedication();
        Patient patient = createPatient();
        MedicationSchedule schedule = createSchedule();

        doNothing().when(loginUserUtil).requirePermission(1L, "medication.view");
        when(patientRepo.findById(1L)).thenReturn(Optional.of(patient));
        when(scheduleRepo.findByPatientIdAndRecordStatus(
                1L, AppConstants.RecordStatus.ACTIVE
        )).thenReturn(List.of(schedule));
        when(medicationRepo.findById(1L)).thenReturn(Optional.of(medication));

        // Act
        List<MedicationScheduleResponse> responses = medicationService.getPatientSchedules(1L);

        // Assert
        assertNotNull(responses);
        assertEquals(1, responses.size());
    }

    // ===================== UPDATE MEDICATION SCHEDULE TESTS =====================

    @Test
    void updateMedicationSchedule_ShouldSuccess_WhenValidRequest() {
        // Arrange
        UpdateMedicationScheduleRequest request = new UpdateMedicationScheduleRequest();
        request.setDosage("1000mg");
        request.setFrequency("Once daily");
        request.setTimeOfDay(LocalTime.of(9, 0));
        request.setStartDate(LocalDate.of(2026, 2, 1));
        request.setEndDate(LocalDate.of(2026, 8, 30));
        request.setInstructions("Take after breakfast");

        MedicationSchedule schedule = createSchedule();
        Medication medication = createMedication();
        Patient patient = createPatient();

        when(scheduleRepo.findById(1L)).thenReturn(Optional.of(schedule));
        doNothing().when(loginUserUtil).requirePermission(1L, "medication.edit_schedule");
        when(scheduleRepo.save(any(MedicationSchedule.class))).thenReturn(schedule);
        when(medicationRepo.findById(1L)).thenReturn(Optional.of(medication));
        when(patientRepo.findById(1L)).thenReturn(Optional.of(patient));

        // Act
        MedicationScheduleResponse response = medicationService.updateMedicationSchedule(1L, request);

        // Assert
        assertNotNull(response);
        verify(scheduleRepo).save(any(MedicationSchedule.class));
    }

    // ===================== DELETE SCHEDULE TESTS =====================

    @Test
    void deleteSchedule_ShouldSuccess_WhenScheduleExists() {
        // Arrange
        MedicationSchedule schedule = createSchedule();

        when(scheduleRepo.findById(1L)).thenReturn(Optional.of(schedule));
        doNothing().when(loginUserUtil).requirePermission(1L, "medication.delete_schedule");
        when(loginUserUtil.getCurrentUserEmail()).thenReturn("bibek.karki@gmail.com");
        when(scheduleRepo.save(any(MedicationSchedule.class))).thenReturn(schedule);

        // Act
        medicationService.deleteSchedule(1L);

        // Assert
        verify(scheduleRepo).save(any(MedicationSchedule.class));
        assertEquals(AppConstants.RecordStatus.INACTIVE, schedule.getRecordStatus());
    }

    // ===================== LOG ADMINISTRATION TESTS =====================

    @Test
    void logAdministration_ShouldSuccess_WhenValidRequest() {
        // Arrange
        LogMedicationRequest request = new LogMedicationRequest();
        request.setScheduleId(1L);
        request.setStatus("GIVEN");
        request.setNotes("Given after breakfast");

        MedicationSchedule schedule = createSchedule();
        // Set time to null to skip time window validation
        schedule.setTimeOfDay(null);

        Medication medication = createMedication();
        Patient patient = createPatient();
        User caregiver = createUser();
        MedicationAdministration savedAdmin = createAdministration();

        when(loginUserUtil.getCurrentUserId()).thenReturn(1L);
        when(scheduleRepo.findById(1L)).thenReturn(Optional.of(schedule));
        doNothing().when(loginUserUtil).requirePermission(1L, "medication.administer");
        when(administrationRepo
                .findFirstByScheduleIdAndAdministeredAtBetweenOrderByAdministeredAtDesc(
                        eq(1L), any(LocalDateTime.class), any(LocalDateTime.class)
                )).thenReturn(Optional.empty());
        when(administrationRepo.save(any(MedicationAdministration.class))).thenReturn(savedAdmin);
        when(medicationRepo.findById(1L)).thenReturn(Optional.of(medication));
        when(patientRepo.findById(1L)).thenReturn(Optional.of(patient));
        when(userRepo.findById(1L)).thenReturn(Optional.of(caregiver));

        // Act
        MedicationAdministrationResponse response = medicationService.logAdministration(request);

        // Assert
        assertNotNull(response);
        assertEquals("Paracetamol", response.getMedicationName());
        assertEquals("GIVEN", response.getStatus());
        verify(administrationRepo).save(any(MedicationAdministration.class));
    }

    // ===================== GET ADMINISTRATION HISTORY TESTS =====================

    @Test
    void getAdministrationHistory_ShouldReturnHistory_WhenRecordsExist() {
        // Arrange
        MedicationAdministration admin = createAdministration();

        doNothing().when(loginUserUtil).requirePermission(1L, "medication.view_history");
        when(administrationRepo.findByPatientIdAndRecordStatusOrderByAdministeredAtDesc(
                1L, AppConstants.RecordStatus.ACTIVE
        )).thenReturn(List.of(admin));

        // Act
        List<MedicationAdministration> history = medicationService.getAdministrationHistory(1L);

        // Assert
        assertNotNull(history);
        assertEquals(1, history.size());
    }
}