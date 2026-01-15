package com.bo.caresync.exceptions;

import lombok.Getter;
import lombok.Setter;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 1/15/2026, 12:35 PM,
 **/
@Getter
@Setter
public class BaseException extends RuntimeException {
    private final IErrorCode errorCode;
    public BaseException(IErrorCode errorCode) {
        this.errorCode = errorCode;
    }

    public BaseException(IErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
}
