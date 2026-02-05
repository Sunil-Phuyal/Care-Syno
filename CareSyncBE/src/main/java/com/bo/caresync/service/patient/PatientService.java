package com.bo.caresync.service.patient;

import com.bo.caresync.constant.AppConstants;
import com.bo.caresync.constant.MessageConstants;
import com.bo.caresync.entity.patient.Patient;
import com.bo.caresync.enums.ErrorCode;
import com.bo.caresync.exceptions.BaseException;
import com.bo.caresync.repository.PatientRepository;
import com.bo.caresync.utils.AppUtil;
import com.bo.caresync.utils.LoginUserUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final LoginUserUtil loginUserUtil;


    @Transactional(readOnly = true)
    public Patient getPatient(Long patientId) {
        String methodName = AppUtil.getMethodName();

        // Check permission (throws exception if denied)
        loginUserUtil.requirePermission(patientId, AppConstants.Permission.PATIENT_VIEW);

        // Permission granted
        Patient patient = patientRepository.findByPatientIdAndRecordStatus(
                        patientId,
                        AppConstants.RecordStatus.ACTIVE
                )
                .orElseThrow(() -> new BaseException(ErrorCode.PATIENT_NOT_FOUND));

        log.info("{} Patient retrieved: patientId={}", methodName, patientId);
        return patient;
    }




}
