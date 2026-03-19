package com.bo.caresync.dto.response.upload;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 3/19/2026, 4:52 PM,
 **/
@Getter
@Setter
@Builder
@AllArgsConstructor
public class ImageUploadResponse {
    private String imageUrl;
    private String fileName;
    private Long fileSize;
    private String uploadedAt;
}