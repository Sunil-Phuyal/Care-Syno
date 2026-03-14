package com.bo.caresync.enums;

import com.bo.caresync.exceptions.IErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/3/2026, 7:32 PM,
 **/
@Getter
public enum ErrorCode implements IErrorCode {

    // Authentication Errors (401)
    INVALID_CREDENTIALS(401, "Invalid email or password"),
    TOKEN_EXPIRED(401, "Authentication token has expired"),
    TOKEN_INVALID(401, "Invalid authentication token"),
    UNAUTHORIZED(401, "Unauthorized access"),

    // Registration Errors (400)
    EMAIL_ALREADY_EXISTS(400, "Email already registered"),
    INVALID_EMAIL_FORMAT(400, "Invalid email format"),
    WEAK_PASSWORD(400, "Password does not meet requirements"),

    // User Errors (404)
    USER_NOT_FOUND(404, "User not found"),
    ROLE_NOT_FOUND(404, "Role not found"),

    // Permission Errors (403)
    PERMISSION_DENIED(403, "Permission denied"),
    NO_PATIENT_ACCESS(403, "No access to this patient"),
    PERMISSION_NOT_FOUND(403, "Permission not found"),

    // Patient Errors (404)
    PATIENT_NOT_FOUND(404, "Patient not found"),
    PATIENT_CAREGIVER_NOT_FOUND(404, "Patient-caregiver relationship not found"),

    // General / System Errors
    INTERNAL_SERVER_ERROR(500, "Internal server error"),
    VALIDATION_ERROR(400, "Validation error"),
    INVALID_INPUT(400, "Invalid input"),
    RESOURCE_NOT_FOUND(404, "Resource not found"),

    // Conflict / Operation Errors
    RESOURCE_ALREADY_EXISTS(409, "Resource already exists"),
    INVALID_OPERATION(400, "Invalid operation"),

    // Patient / Medication
    PATIENT_ALREADY_EXISTS(409, "A patient with this name and date of birth already exists"),
    MEDICATION_NOT_FOUND(404, "Medication not found");

    private final int httpStatus;
    private final String message;

    ErrorCode(int httpStatus, String message) {
        this.httpStatus = httpStatus;
        this.message = message;
    }

    @Override
    public int getHttpStatus() {
        return httpStatus;
    }

    @Override
    public String getMessage() {
        return message;
    }
}
