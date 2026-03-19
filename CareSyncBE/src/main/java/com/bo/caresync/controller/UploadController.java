package com.bo.caresync.controller;

import com.bo.caresync.dto.request.upload.ImageUploadRequest;
import com.bo.caresync.dto.response.upload.ImageUploadResponse;
import com.bo.caresync.service.upload.UploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 3/19/2026, 5:13 PM,
 **/
@Slf4j
@RestController
@RequestMapping("/api/v1/uploads")
@RequiredArgsConstructor
public class UploadController extends BaseController {

    private final UploadService uploadService;

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadImage(@ModelAttribute ImageUploadRequest request) {
        ImageUploadResponse response = uploadService.uploadImage(request);
        return successResponse("Image uploaded successfully", response);
    }
}