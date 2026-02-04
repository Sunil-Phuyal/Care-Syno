package com.bo.caresync.utils;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/4/2026, 6:34 PM,
 **/
public class JwtKeyGenerator {
    public static void main(String[] args) {
        try {
            KeyGenerator keyGen = KeyGenerator.getInstance("HmacSHA512");
            keyGen.init(512);
            SecretKey secretKey = keyGen.generateKey();
            String base64Key = Base64.getEncoder().encodeToString(secretKey.getEncoded());

            System.out.println("=".repeat(80));
            System.out.println("JWT Secret Key (Base64-encoded HS512):");
            System.out.println("=".repeat(80));
            System.out.println(base64Key);
            System.out.println("=".repeat(80));
            System.out.println("Copy this value to your application.properties:");
            System.out.println("jwt.secret=REMOVED
            System.out.println("=".repeat(80));
        } catch (NoSuchAlgorithmException e) {
            System.err.println("Error generating key: " + e.getMessage());
        }
    }
}