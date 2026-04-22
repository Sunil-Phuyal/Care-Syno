package com.bo.caresync.service.authentication;

import com.bo.caresync.enums.ErrorCode;
import com.bo.caresync.exceptions.BaseException;
import com.bo.caresync.utils.SymmetricEncryptionUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 4/4/2026, 10:59 AM,
 **/
@Service
@RequiredArgsConstructor
public class ResetLinkService {

    private final SymmetricEncryptionUtil symmetricEncryptionUtil;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public static final ConcurrentHashMap<String, Boolean> usedResetTokens = new ConcurrentHashMap<>();

    @Value("${jwt.encryption.key}")
    private String AES_KEY;

    @Value("${reset-link.invite-base-url}")
    private String inviteBaseUrl;

    @Value("${reset-link.forgot-password-base-url}")
    private String forgotPasswordBaseUrl;

    @Value("${reset-link.expiration-time}")
    private long resetLinkExpiration;

    private final String className = this.getClass().getSimpleName();

    /**
     * Generates a secure encrypted link
     * linkType: "INVITE" or "FORGOT_PASSWORD"
     */
    public String generateLink(Long userId, String linkType) throws Exception {
        String tokenId = UUID.randomUUID().toString();
        String createdDate = LocalDateTime.now().toString();

        String dataToEncrypt = objectMapper.writeValueAsString(Map.of(
                "userId", userId.toString(),
                "createdDate", createdDate,
                "tokenId", tokenId,
                "linkType", linkType
        ));

        String encryptedData = symmetricEncryptionUtil.encrypt(
                dataToEncrypt, AES_KEY,
                SymmetricEncryptionUtil.EncryptionAlgorithm.AES_GCM
        );

        // URL encode so +, /, = characters don't get corrupted in the URL
        String urlSafeToken = URLEncoder.encode(encryptedData, StandardCharsets.UTF_8);

        String baseUrl = "INVITE".equals(linkType) ? inviteBaseUrl : forgotPasswordBaseUrl;
        return baseUrl + urlSafeToken;
    }

    /**
     * Decrypts and validates the token
     * Returns the payload map if valid
     */
    public Map<String, String> validateAndDecrypt(String encryptedToken) throws Exception {
        Map<String, String> payload = decryptToken(encryptedToken);

        String userId = payload.get("userId");
        String createdDate = payload.get("createdDate");
        String tokenId = payload.get("tokenId");

        if (userId == null || createdDate == null || tokenId == null) {
            throw new BaseException(ErrorCode.INVALID_TOKEN, "Invalid reset link data");
        }

        LocalDateTime creationDateTime = LocalDateTime.parse(createdDate);
        if (creationDateTime.plusHours(resetLinkExpiration).isBefore(LocalDateTime.now())) {
            throw new BaseException(ErrorCode.TOKEN_EXPIRED, "Reset link has expired");
        }

        if (usedResetTokens.containsKey(tokenId)) {
            throw new BaseException(ErrorCode.TOKEN_ALREADY_USED, "Reset link has already been used");
        }

        return payload;
    }

    public Map<String, String> decryptToken(String encryptedData) throws Exception {
        try {
            // URL decode first so +, /, = are restored before decryption
            String decoded = URLDecoder.decode(encryptedData, StandardCharsets.UTF_8);

            String decryptedData = symmetricEncryptionUtil.decrypt(
                    decoded, AES_KEY,
                    SymmetricEncryptionUtil.EncryptionAlgorithm.AES_GCM
            );
            return objectMapper.readValue(decryptedData, Map.class);
        } catch (Exception e) {
            throw new BaseException(ErrorCode.INVALID_TOKEN, "Invalid or tampered reset link");
        }
    }

    public void markTokenAsUsed(String tokenId) {
        usedResetTokens.put(tokenId, true);
    }

    public long getResetLinkExpiration() {
        return resetLinkExpiration;
    }
}