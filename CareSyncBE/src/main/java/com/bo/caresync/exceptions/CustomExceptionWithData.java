package com.bo.caresync.exceptions;

import lombok.Getter;
import lombok.Setter;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 1/15/2026, 12:39 PM,
 **/
@Getter
@Setter
public class CustomExceptionWithData extends BaseException {
    private Object data;

    public CustomExceptionWithData(IErrorCode errorCode, Object data) {
        super(errorCode);
        this.data = data;
    }

    public CustomExceptionWithData(IErrorCode errorCode, String message, Object data) {
        super(errorCode,message);
        this.data = data;
    }
}
