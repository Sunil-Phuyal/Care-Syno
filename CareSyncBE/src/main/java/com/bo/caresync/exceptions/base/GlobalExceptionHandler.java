package com.bo.caresync.exceptions.base;

import com.bo.caresync.dto.response.ApiResponse;
import com.bo.caresync.dto.response.ResponseData;
import com.bo.caresync.enums.ResponseStatus;
import com.bo.caresync.exceptions.BaseException;
import com.bo.caresync.exceptions.CustomExceptionWithData;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 1/15/2026, 6:17 PM,
 **/
@Order(1)
@RestControllerAdvice
@Slf4j
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private static final String URN_HEADER = "urn";
    private static final String APPLICATION_PACKAGE = "com.bo.caresync";

    @Value("${spring.application.name}")
    private String applicationName;

    private void printErrorLog(Exception exception, HttpServletRequest request) {
        String urn = MDC.get(URN_HEADER);
        String exceptionClassName = exception.getClass().getSimpleName();
        StackTraceElement[] stackTrace = exception.getStackTrace();
        if (stackTrace == null || stackTrace.length == 0) {
            log.error("[URN_{}] {} error in service: {} - No stack trace available. Exception: {}",
                    urn, exceptionClassName, applicationName, exception.getMessage());
            return;
        }

        StackTraceElement errorOrigin = stackTrace[0];
        boolean isApplicationError = errorOrigin.getClassName().startsWith(APPLICATION_PACKAGE);
        StackTraceElement externalSource = null;
        for (StackTraceElement element : stackTrace) {
            if (!element.getClassName().startsWith(APPLICATION_PACKAGE)) {
                externalSource = element;
                break;
            }
        }
        if (isApplicationError) {
            log.error("[URN_{}] {} error in application method {}:{}() service: {} line: {} - {}",
                    urn,
                    exceptionClassName,
                    errorOrigin.getClassName(),
                    errorOrigin.getMethodName(),
                    applicationName,
                    errorOrigin.getLineNumber(),
                    exception.getMessage());
        }
        StackTraceElement contextSource = (externalSource != null) ? externalSource : errorOrigin;
        log.error("[URN_{}] {} error context in class {}:{}() service: {} line: {} - {}",
                urn,
                exceptionClassName,
                contextSource.getClassName(),
                contextSource.getMethodName(),
                applicationName,
                contextSource.getLineNumber(),
                exception.getMessage());
    }

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<Object> baseException(BaseException exception, HttpServletRequest request) {
        printErrorLog(exception, request);
        ApiResponse apiResponse = createApiResponse(exception, new HashMap<>());
        return ResponseEntity.ok(apiResponse);
    }

    @ExceptionHandler(CustomExceptionWithData.class)
    public ResponseEntity<Object> genericException(CustomExceptionWithData exception, HttpServletRequest request) {
        printErrorLog(exception, request);
        ApiResponse apiResponse = createApiResponse(exception, exception.getData());
        return ResponseEntity.ok(apiResponse);
    }

    private ApiResponse createApiResponse(BaseException baseException, Object data) {
        ApiResponse apiResponse = new ApiResponse();

        String errorCode = Integer.toString(baseException.getErrorCode().getHttpStatus());
        String errorMessage = baseException.getMessage() != null
                ? baseException.getMessage()
                : baseException.getErrorCode().getMessage();
        ResponseData responseData = new ResponseData(errorCode, errorMessage, data);
        apiResponse.setResponse(
                ResponseStatus.SUCCESS,
                responseData,
                applicationName
        );
        return apiResponse;
    }
}