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
    INVALID_CREDENTIALS("AUTH_001", "Invalid email or password"),
    TOKEN_EXPIRED("AUTH_002", "Authentication token has expired"),
    TOKEN_INVALID("AUTH_003", "Invalid authentication token"),
    UNAUTHORIZED("AUTH_004", "Unauthorized access"),

    // Registration Errors (400)
    EMAIL_ALREADY_EXISTS("REG_001", "Email already registered"),
    INVALID_EMAIL_FORMAT("REG_002", "Invalid email format"),
    WEAK_PASSWORD("REG_003", "Password does not meet requirements"),

    // User Errors (404)
    USER_NOT_FOUND("USER_001", "User not found"),
    ROLE_NOT_FOUND("USER_002", "Role not found"),

    // General Errors
    INTERNAL_SERVER_ERROR("SYS_001", "Internal server error"),
    VALIDATION_ERROR("SYS_002", "Validation error");

    private final String code;
    private final String message;

    ErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    @Override
    public int getHttpStatus() {
        return 0;
    }

//    @Override
//    public String getCode() {
//        return code;
//    }
//
//    @Override
//    public String getMessage() {
//        return message;
//    }
}
