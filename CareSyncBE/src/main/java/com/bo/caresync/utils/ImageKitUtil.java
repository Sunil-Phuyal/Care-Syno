package com.bo.caresync.utils;

import io.imagekit.sdk.ImageKit;
import io.imagekit.sdk.config.Configuration;
import io.imagekit.sdk.models.FileCreateRequest;
import io.imagekit.sdk.models.results.Result;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 1/31/2026, 3:31 PM,
 **/
@Service
public class ImageKitUtil {

    @Value("${imagekit.private.key}")
    private String privateKey;

    @Value("${imagekit.public.key}")
    private String publicKey;

    @Value("${imagekit.url.endpoint}")
    private String urlEndpoint;

    private ImageKit imageKit;

    @PostConstruct
    public void init() {
        ImageKit imageKit = ImageKit.getInstance();
        Configuration config = new Configuration();
        config.setPublicKey(publicKey);
        config.setPrivateKey(privateKey);
        config.setUrlEndpoint(urlEndpoint);
        imageKit.setConfig(config);
        this.imageKit = imageKit;
    }

    public String uploadImage(MultipartFile file, String folder, String fileName) throws Exception {
        if (file == null || file.isEmpty()) {
            return null;
        }

        byte[] fileBytes = file.getBytes();
        String uniqueFileName = fileName + "_" + System.currentTimeMillis();

        FileCreateRequest fileCreateRequest = new FileCreateRequest(fileBytes, uniqueFileName);
        fileCreateRequest.setFolder(folder);
        fileCreateRequest.setUseUniqueFileName(false);

        Result uploadResult = imageKit.upload(fileCreateRequest);
        return uploadResult.getUrl();
    }

    public String uploadImage(byte[] fileBytes, String folder, String fileName) throws Exception {
        if (fileBytes == null || fileBytes.length == 0) {
            return null;
        }

        String uniqueFileName = fileName + "_" + System.currentTimeMillis();

        FileCreateRequest fileCreateRequest = new FileCreateRequest(fileBytes, uniqueFileName);
        fileCreateRequest.setFolder(folder);
        fileCreateRequest.setUseUniqueFileName(false);

        Result uploadResult = imageKit.upload(fileCreateRequest);
        return uploadResult.getUrl();
    }

    public void deleteImage(String fileId) throws Exception {
        if (fileId != null && !fileId.isEmpty()) {
            imageKit.deleteFile(fileId);
        }
    }
}