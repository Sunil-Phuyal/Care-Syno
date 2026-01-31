package com.bo.caresync.constant;

/**
 * @author Sunil Phuyal
 * @version v1.0
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
}
