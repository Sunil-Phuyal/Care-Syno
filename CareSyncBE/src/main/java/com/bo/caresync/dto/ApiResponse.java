package com.bo.caresync.dto;

import com.bo.caresync.enums.AppEnum;
import com.bo.caresync.enums.ResponseStatus;
import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import com.bo.caresync.utils.ApplicationPropertyLoader;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 1/15/2026, 6:46 PM,
 **/

@Getter
@Setter
public class ApiResponse {

    private String apiResponseCode;
    private String apiResponseMessage;
    @JsonAlias({"apiResponseDateTime", "apiResponseTime"})
    private String apiResponseTime;
    private String apiResponseFrom;
    private ResponseData apiResponseData;

    public ApiResponse() {
        this.apiResponseCode = AppEnum.SUCCESS_RESPONSE_CODE.staticData;
        this.apiResponseMessage = ResponseStatus.SUCCESS.toString();
        this.apiResponseTime = getCurrentTimestamp();
        this.apiResponseFrom = buildResponseFrom(null);
        this.apiResponseData = new ResponseData();
    }

    public ApiResponse(String source) {
        this.apiResponseCode = AppEnum.SUCCESS_RESPONSE_CODE.staticData;
        this.apiResponseMessage = ResponseStatus.SUCCESS.toString();
        this.apiResponseTime = getCurrentTimestamp();
        this.apiResponseFrom = source;
        this.apiResponseData = new ResponseData();
    }

    public void setResponse(String code, ResponseStatus status, ResponseData data) {
        this.apiResponseCode = code;
        this.apiResponseMessage = status.toString();
        this.apiResponseTime = getCurrentTimestamp();
        this.apiResponseFrom = buildResponseFrom(null);
        this.apiResponseData = data != null ? data : new ResponseData();
    }

    public void setResponse(String code, ResponseStatus status, ResponseData data, String applicationName) {
        this.apiResponseCode = code;
        this.apiResponseMessage = status.toString();
        this.apiResponseTime = getCurrentTimestamp();
        this.apiResponseFrom = buildResponseFrom(applicationName);
        this.apiResponseData = data != null ? data : new ResponseData();
    }
    private String getCurrentTimestamp() {
        DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
        return LocalDateTime.now().format(formatter);
    }

    private String buildResponseFrom(String applicationName) {
        if (applicationName != null && !applicationName.trim().isEmpty()) {
            return "JAVA : " + applicationName;
        }

        String appNameFromConfig = ApplicationPropertyLoader.getMessageKey("spring.application.name");
        if (appNameFromConfig != null && !appNameFromConfig.trim().isEmpty()) {
            return AppEnum.RESPONSE_FROM.staticData + " : " + appNameFromConfig;
        }
        return AppEnum.RESPONSE_FROM.staticData;
    }
}
