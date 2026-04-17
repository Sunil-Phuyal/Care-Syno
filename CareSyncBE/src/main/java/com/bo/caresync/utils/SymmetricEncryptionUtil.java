package com.bo.caresync.utils;

import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 4/4/2026, 11:01 AM,
 **/
@Component
public class SymmetricEncryptionUtil {

    public enum EncryptionAlgorithm {
        AES_ECB("AES/ECB/PKCS5Padding"),
        AES_CBC("AES/CBC/PKCS5Padding"),
        AES_GCM("AES/GCM/NoPadding");

        private final String transformation;

        EncryptionAlgorithm(String transformation) {
            this.transformation = transformation;
        }

        public String getTransformation() {
            return transformation;
        }
    }

    private static final int AES_KEY_SIZE = 256;
    private static final int GCM_TAG_LENGTH = 128;
    private static final int IV_SIZE = 16;

    public String generateKey(EncryptionAlgorithm algorithm) throws NoSuchAlgorithmException {
        KeyGenerator keyGen = KeyGenerator.getInstance("AES");
        keyGen.init(AES_KEY_SIZE);
        SecretKey key = keyGen.generateKey();
        return Base64.getEncoder().encodeToString(key.getEncoded());
    }

    public String encrypt(String data, String base64Key, EncryptionAlgorithm algorithm) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(base64Key);
        SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");
        Cipher cipher = Cipher.getInstance(algorithm.getTransformation());

        if (algorithm == EncryptionAlgorithm.AES_ECB) {
            cipher.init(Cipher.ENCRYPT_MODE, keySpec);
            byte[] encrypted = cipher.doFinal(data.getBytes());
            return Base64.getEncoder().encodeToString(encrypted);
        } else {
            byte[] iv = new byte[IV_SIZE];
            new SecureRandom().nextBytes(iv);

            if (algorithm == EncryptionAlgorithm.AES_CBC) {
                cipher.init(Cipher.ENCRYPT_MODE, keySpec, new IvParameterSpec(iv));
            } else {
                cipher.init(Cipher.ENCRYPT_MODE, keySpec, new GCMParameterSpec(GCM_TAG_LENGTH, iv));
            }

            byte[] encrypted = cipher.doFinal(data.getBytes());
            byte[] combined = new byte[iv.length + encrypted.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(encrypted, 0, combined, iv.length, encrypted.length);
            return Base64.getEncoder().encodeToString(combined);
        }
    }

    public String decrypt(String encryptedData, String base64Key, EncryptionAlgorithm algorithm) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(base64Key);
        SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");
        Cipher cipher = Cipher.getInstance(algorithm.getTransformation());
        byte[] decoded = Base64.getDecoder().decode(encryptedData);

        if (algorithm == EncryptionAlgorithm.AES_ECB) {
            cipher.init(Cipher.DECRYPT_MODE, keySpec);
            return new String(cipher.doFinal(decoded));
        } else {
            byte[] iv = new byte[IV_SIZE];
            byte[] encrypted = new byte[decoded.length - IV_SIZE];
            System.arraycopy(decoded, 0, iv, 0, IV_SIZE);
            System.arraycopy(decoded, IV_SIZE, encrypted, 0, encrypted.length);

            if (algorithm == EncryptionAlgorithm.AES_CBC) {
                cipher.init(Cipher.DECRYPT_MODE, keySpec, new IvParameterSpec(iv));
            } else {
                cipher.init(Cipher.DECRYPT_MODE, keySpec, new GCMParameterSpec(GCM_TAG_LENGTH, iv));
            }
            return new String(cipher.doFinal(encrypted));
        }
    }

    public static void main(String[] args) throws Exception {
        SymmetricEncryptionUtil util = new SymmetricEncryptionUtil();
        String key = util.generateKey(EncryptionAlgorithm.AES_GCM);
        System.out.println("Key: " + key);

        String encrypted = util.encrypt("Sunil@", key, EncryptionAlgorithm.AES_GCM);
        System.out.println("Encrypted: " + encrypted);

        String decrypted = util.decrypt(encrypted, key, EncryptionAlgorithm.AES_GCM);
        System.out.println("Decrypted: " + decrypted);
    }
}