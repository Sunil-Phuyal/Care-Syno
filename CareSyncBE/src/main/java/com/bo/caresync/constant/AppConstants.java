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

    public static class Cors {
        private Cors() {}

        public static final String ACCESS_CONTROL_ALLOW_ORIGIN = "Access-Control-Allow-Origin";
        public static final String ACCESS_CONTROL_ALLOW_METHODS = "Access-Control-Allow-Methods";
        public static final String ACCESS_CONTROL_ALLOW_HEADERS = "Access-Control-Allow-Headers";
        public static final String ACCESS_CONTROL_MAX_AGE = "Access-Control-Max-Age";
        public static final String ACCESS_CONTROL_EXPOSE_HEADERS = "Access-Control-Expose-Headers";

        public static final String ALL = "*";
        public static final String OPTIONS_METHOD = "OPTIONS";
        public static final String MAX_AGE_24_HOURS = "86400";
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

    public static class Permission {
        private Permission() {}

        // Patient permissions
        public static final String PATIENT_VIEW = "patient.view";
        public static final String PATIENT_EDIT = "patient.edit";
        public static final String PATIENT_DELETE = "patient.delete";

        // Medication permissions
        public static final String MEDICATION_VIEW = "medication.view";
        public static final String MEDICATION_CREATE_SCHEDULE = "medication.create_schedule";
        public static final String MEDICATION_EDIT_SCHEDULE = "medication.edit_schedule";
        public static final String MEDICATION_DELETE_SCHEDULE = "medication.delete_schedule";
        public static final String MEDICATION_ADMINISTER = "medication.administer";
        public static final String MEDICATION_ADMINISTER_INJECTION = "medication.administer_injection";
        public static final String MEDICATION_SKIP = "medication.skip";
        public static final String MEDICATION_VIEW_HISTORY = "medication.view_history";

        // Caregiver permissions
        public static final String CAREGIVER_VIEW = "caregiver.view";
        public static final String CAREGIVER_INVITE = "caregiver.invite";
        public static final String CAREGIVER_REMOVE = "caregiver.remove";
        public static final String CAREGIVER_EDIT_PERMISSIONS = "caregiver.edit_permissions";

        // Report permissions
        public static final String REPORT_VIEW = "report.view";
        public static final String REPORT_EXPORT = "report.export";

        // Medical permissions
        public static final String MEDICAL_RECORD_VITALS = "medical.record_vitals";
    }

}
