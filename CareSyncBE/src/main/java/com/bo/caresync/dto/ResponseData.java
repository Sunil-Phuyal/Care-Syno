package com.bo.caresync.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 1/15/2026, 6:55 PM,
 **/
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ResponseData {

    private String responseCode;
    private String responseMessage;

    @JsonAlias({"responseData", "data"})
    private Object responseData;
    public void setResponseData(String code, String responseMessage, Object data) {
        this.responseCode = code;
        this.responseMessage = responseMessage;
        this.responseData = data;
    }
}
