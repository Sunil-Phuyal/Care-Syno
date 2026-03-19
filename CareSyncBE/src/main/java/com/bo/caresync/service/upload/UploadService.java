package com.bo.caresync.service.upload;

import com.bo.caresync.dto.response.upload.ImageUploadResponse;
import com.bo.caresync.enums.ErrorCode;
import com.bo.caresync.exceptions.BaseException;
import com.bo.caresync.utils.ImageKitUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.bo.caresync.dto.request.upload.ImageUploadRequest;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 3/19/2026, 4:54 PM,
 **/
@Slf4j
@Service
@RequiredArgsConstructor
public class UploadService {

    private final ImageKitUtil imageKitUtil;
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp"
    );

    private static final long MAX_FILE_SIZE = 15 * 1024 * 1024;

    public ImageUploadResponse uploadImage(ImageUploadRequest request) {
        String methodName = "uploadImage";

        MultipartFile image = request.getImage();

        log.debug("{} Uploading image: {}", methodName, image.getOriginalFilename());
        validateImage(image);
        try {
            String folder = request.getFolder();
            if (folder == null || folder.isEmpty()) {
                folder = "caresync/general";
            } else {
                folder = "caresync/" + folder;
            }
            String fileName = request.getFileName();
            if (fileName == null || fileName.isEmpty()) {
                fileName = "upload";
            }
            String imageUrl = imageKitUtil.uploadImage(image, folder, fileName);
            if (imageUrl == null || imageUrl.isEmpty()) {
                throw new BaseException(ErrorCode.FILE_UPLOAD_FAILED,
                        "Failed to upload image to storage");
            }

            log.info("{} Image uploaded successfully: {}", methodName, imageUrl);
            return ImageUploadResponse.builder()
                    .imageUrl(imageUrl)
                    .fileName(image.getOriginalFilename())
                    .fileSize(image.getSize())
                    .uploadedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                    .build();

        } catch (BaseException e) {
            throw e;
        } catch (Exception e) {
            log.error("{} Error uploading image: {}", methodName, e.getMessage(), e);
            throw new BaseException(ErrorCode.FILE_UPLOAD_FAILED,
                    "Failed to upload image: " + e.getMessage());
        }
    }

    /**
     * Validate image file
     */
    private void validateImage(MultipartFile image) {
        // Check if file is empty
        if (image == null || image.isEmpty()) {
            throw new BaseException(ErrorCode.INVALID_INPUT, "Image file is required");
        }

        // Check file size
        if (image.getSize() > MAX_FILE_SIZE) {
            throw new BaseException(ErrorCode.FILE_TOO_LARGE,
                    "Image size must not exceed 5MB. Current size: " +
                            (image.getSize() / 1024 / 1024) + "MB");
        }

        // Check content type
        String contentType = image.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BaseException(ErrorCode.INVALID_FILE_TYPE,
                    "Invalid image type. Allowed types: JPEG, PNG, GIF, WEBP");
        }

        log.debug("Image validation passed: {} ({})",
                image.getOriginalFilename(), contentType);
    }
}