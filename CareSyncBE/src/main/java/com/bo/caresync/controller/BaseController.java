package com.bo.caresync.controller;

import com.bo.caresync.dto.response.ApiResponse;
import com.bo.caresync.dto.response.ResponseData;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;

import java.io.Serializable;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 1/16/2026, 3:27 PM,
 **/
@Slf4j
public class BaseController implements Serializable {

    public ResponseEntity<ApiResponse> successResponse(String message, Object data){
        ResponseData responseData = new ResponseData("200",message, data);
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setApiResponseData(responseData);
        return ResponseEntity.ok(apiResponse);
    }

    public ResponseEntity<ApiResponse> successResponse(String message, Object data,boolean isResponsePrint){
        ResponseData responseData = new ResponseData("200",message, data);
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setApiResponseData(responseData);
        if(isResponsePrint) log.info("Response From Controller layer is : {} ",apiResponse);
        return ResponseEntity.ok(apiResponse);
    }

    public ResponseEntity<ApiResponse> successResponse(String apiCode,String message, Object data,boolean isResponsePrint){
        ResponseData responseData = new ResponseData(apiCode,message, data);
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setApiResponseData(responseData);
        if(isResponsePrint) log.info("Response From Controller layer is : {} ",apiResponse);
        return ResponseEntity.ok(apiResponse);
    }





}
