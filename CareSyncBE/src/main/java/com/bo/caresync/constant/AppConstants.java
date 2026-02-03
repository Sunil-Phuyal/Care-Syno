package com.bo.caresync.constant;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 1/31/2026, 6:05 PM,
 **/

public class AppConstants {
    private AppConstants() {

    }
    public static class Auditor {
        private Auditor() {}

        public static final String SYSTEM_USER = "system";
        public static final String ANONYMOUS_USER = "anonymousUser";
    }

    public static class RecordStatus {
        private RecordStatus() {}
        public static final String ACTIVE = "Y";
        public static final String INACTIVE = "N";
    }

    public static class Role {
        private Role() {}
        public static final String ADMIN = "ROLE_ADMIN";
        public static final String PRIMARY_CAREGIVER = "ROLE_PRIMARY_CAREGIVER";
        public static final String SECONDARY_CAREGIVER = "ROLE_SECONDARY_CAREGIVER";
        public static final String HEALTHCARE_PROVIDER = "ROLE_HEALTHCARE_PROVIDER";
    }

    public static class JwtClaims {
        private JwtClaims() {}

        public static final String EMAIL = "email";
        public static final String ROLES = "roles";
        public static final String TYPE = "type";
    }
    public static class TokenType {
        private TokenType() {}

        public static final String ACCESS = "ACCESS";
        public static final String REFRESH = "REFRESH";
    }
    public static class Http {
        private Http() {}

        public static final String AUTHORIZATION = "Authorization";
        public static final String BEARER_PREFIX = "Bearer ";
    }

}
