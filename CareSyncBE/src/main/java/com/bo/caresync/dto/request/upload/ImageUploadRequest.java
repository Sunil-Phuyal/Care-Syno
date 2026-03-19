package com.bo.caresync.dto.request.upload;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 3/19/2026, 4:50 PM,
 **/
@Getter
@Setter
public class ImageUploadRequest {
    private MultipartFile image;
    private String folder;
    private String fileName;
}
