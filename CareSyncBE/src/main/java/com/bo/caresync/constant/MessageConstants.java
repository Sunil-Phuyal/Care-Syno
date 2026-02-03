package com.bo.caresync.constant;

/**
 * @author Sunil Phuyal
 * @version v2.0
 * @project CareSyncBE
 * @since 1/31/2026, 6:13 PM,
 **/
public class MessageConstants {
    private MessageConstants() {
        // Prevent instantiation
    }

    public static class Auditor {
        private Auditor() {}

        public static final String PRINCIPAL_EXTRACTION_FAILED = "Failed to extract principal name from type: {}";
        public static final String UNKNOWN_PRINCIPAL_TYPE = "Unknown principal type, defaulting to system user";
        public static final String ERROR = "Error while getting current auditor: {}";
    }

    public static class Auth {
        private Auth() {}

        public static final String REGISTRATION_SUCCESS = "User registered successfully";
        public static final String LOGIN_SUCCESS = "Login successful";
        public static final String EMAIL_ALREADY_EXISTS = "Email already registered";
        public static final String INVALID_CREDENTIALS = "Invalid email or password";
        public static final String USER_NOT_FOUND = "User not found";
        public static final String ACCOUNT_INACTIVE = "Account is inactive";
        public static final String EMAIL_NOT_VERIFIED = "Email not verified";
        public static final String TOKEN_MISSING = "Authorization token is missing";
        public static final String TOKEN_FORMAT_INVALID = "Authorization header format is invalid";
    }

    public static class Jwt {
        private Jwt() {}

        public static final String VALIDATION_FAILED = "JWT validation failed: {}";
        public static final String SECRET_TOO_SHORT = "JWT secret must be at least 32 bytes long";
        public static final String SUBJECT_MISSING = "JWT subject (userId) is missing";
        public static final String SUBJECT_INVALID = "JWT subject is not a valid Long: {}";
        public static final String CLAIM_MISSING = "JWT claim '{}' is missing or blank";
        public static final String CLAIM_EMPTY_LIST = "JWT claim '{}' is missing or empty";
        public static final String TOKEN_TYPE_INVALID = "JWT claim 'type' is not a valid TokenType: {}";
        public static final String TOKEN_TYPE_MISMATCH = "Token type mismatch — expected: {}, actual: {}";
    }
}