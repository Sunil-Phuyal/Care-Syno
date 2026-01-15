package com.bo.caresync.enums;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 1/15/2026, 6:57 PM,
 **/
public enum AppEnum {

    SUCCESS_RESPONSE_CODE("200"),
    BAD_REQUEST_CODE("400"),
    UNAUTHORIZED_CODE("401"),
    VALIDATION_FAILURE_CODE("422"),

    SUCCESS_RESPONSE_MESSAGE("Success"),
    FAILURE_RESPONSE_MESSAGE("Failure"),
    REQUEST_PROCESSED_SUCCESS("Request processed successfully"),
    DATA_RETRIEVE_SUCCESS("Data retrieved successfully"),
    VALIDATION_FAILURES("Validation failure"),
    GENERIC_ERROR_MESSAGE("Something went wrong"),

    RESPONSE_CODE_STRING("responseCode"),
    RESPONSE_MESSAGE_STRING("responseMessage"),

    RESPONSE_CODE_STRING_DB("response_code"),
    RESPONSE_MESSAGE_STRING_DB("response_message"),

    RESPONSE_FROM("JAVA"),
    MIDDLE_WARE("MIDDLEWARE"),
    SERVICE_NAME("serviceName"),
    CLASS_NAME("className"),

    URN_HEADER("urn"),
    URN("URN"),

    SHA256("SHA-256"),
    SHA512("SHA-512"),

    FROM_DATE_TIMESTAMP("T00:00:00.000+00:00");

    public final String staticData;

    AppEnum(String staticData) {
        this.staticData = staticData;
    }
}
