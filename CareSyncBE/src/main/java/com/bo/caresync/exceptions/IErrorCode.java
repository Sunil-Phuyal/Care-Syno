package com.bo.caresync.exceptions;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 1/15/2026, 12:36 PM,
 **/

public interface IErrorCode {
    int getHttpStatus();
    String getMessage();
}
