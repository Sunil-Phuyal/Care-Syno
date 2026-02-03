package com.bo.caresync.utils;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.bo.caresync.constant.AppConstants;
import com.bo.caresync.constant.MessageConstants;
import com.bo.caresync.enums.ErrorCode;
import com.bo.caresync.enums.TokenType;
import com.bo.caresync.exceptions.BaseException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

/**
 * @author Sunil Phuyal
 * @version v2.0
 * @project CareSyncBE
 * @since 2/3/2026
 */
@Slf4j
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Duration expiration;

    @Value("${jwt.refresh-expiration}")
    private Duration refreshExpiration;

    /** Holds all extracted claims from a validated JWT token */
    public record TokenData(Long userId, String email, List<String> roles, TokenType type) {}

    /** Builds the HMAC256 signing algorithm, enforcing a minimum key length of 32 bytes */
    private Algorithm getSigningAlgorithm() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException(MessageConstants.Jwt.SECRET_TOO_SHORT);
        }
        return Algorithm.HMAC256(keyBytes);
    }

    /** Generates an access token for the given user */
    public String generateAccessToken(Long userId, String email, List<String> roles) {
        return buildToken(userId, email, roles, TokenType.ACCESS, expiration);
    }

    /** Generates a refresh token for the given user */
    public String generateRefreshToken(Long userId, String email, List<String> roles) {
        return buildToken(userId, email, roles, TokenType.REFRESH, refreshExpiration);
    }

    /** Builds and signs a JWT token with the provided claims and expiration duration */
    private String buildToken(Long userId, String email, List<String> roles, TokenType type, Duration duration) {
        Instant now = Instant.now();
        return JWT.create()
                .withSubject(userId.toString())
                .withClaim(AppConstants.JwtClaims.EMAIL, email)
                .withClaim(AppConstants.JwtClaims.ROLES, roles)
                .withClaim(AppConstants.JwtClaims.TYPE, type.name())
                .withIssuedAt(now)
                .withExpiresAt(now.plus(duration))
                .sign(getSigningAlgorithm());
    }

    /** Validates the token signature and expiration */
    public DecodedJWT validateToken(String token) {
        try {
            return JWT.require(getSigningAlgorithm())
                    .build()
                    .verify(token);
        } catch (JWTVerificationException e) {
            log.error(MessageConstants.Jwt.VALIDATION_FAILED, e.getMessage());
            throw new BaseException(ErrorCode.TOKEN_INVALID);
        }
    }

    /** Validates the token and enforces the expected token type */
    public DecodedJWT validateToken(String token, TokenType expectedType) {
        DecodedJWT jwt = validateToken(token);
        TokenType actualType = extractTokenType(jwt);
        if (actualType != expectedType) {
            log.warn(MessageConstants.Jwt.TOKEN_TYPE_MISMATCH, expectedType, actualType);
            throw new BaseException(ErrorCode.TOKEN_INVALID);
        }
        return jwt;
    }

    /** Validates the token and extracts all claims in a single parse */
    public TokenData extractTokenData(String token) {
        DecodedJWT jwt = validateToken(token);
        return new TokenData(
                extractUserId(jwt),
                extractEmail(jwt),
                extractRoles(jwt),
                extractTokenType(jwt)
        );
    }

    /** Extracts all claims from an already validated token */
    public TokenData extractTokenData(DecodedJWT jwt) {
        return new TokenData(
                extractUserId(jwt),
                extractEmail(jwt),
                extractRoles(jwt),
                extractTokenType(jwt)
        );
    }

    /** Extracts the user ID from the token subject */
    public Long getUserIdFromToken(String token) {
        return extractUserId(validateToken(token));
    }

    /** Extracts the email from the token claims */
    public String getEmailFromToken(String token) {
        return extractEmail(validateToken(token));
    }

    /** Extracts the roles list from the token claims */
    public List<String> getRolesFromToken(String token) {
        return extractRoles(validateToken(token));
    }

    /** Extracts the token type from the token claims */
    public TokenType getTokenTypeFromToken(String token) {
        return extractTokenType(validateToken(token));
    }

    /** Parses and validates the user ID from the JWT subject */
    private Long extractUserId(DecodedJWT jwt) {
        String subject = jwt.getSubject();
        if (subject == null || subject.isBlank()) {
            log.error(MessageConstants.Jwt.SUBJECT_MISSING);
            throw new BaseException(ErrorCode.TOKEN_INVALID);
        }
        try {
            return Long.parseLong(subject);
        } catch (NumberFormatException e) {
            log.error(MessageConstants.Jwt.SUBJECT_INVALID, subject);
            throw new BaseException(ErrorCode.TOKEN_INVALID);
        }
    }

    /** Parses and validates the email claim from the token */
    private String extractEmail(DecodedJWT jwt) {
        String email = jwt.getClaim(AppConstants.JwtClaims.EMAIL).asString();
        if (email == null || email.isBlank()) {
            log.error(MessageConstants.Jwt.CLAIM_MISSING, AppConstants.JwtClaims.EMAIL);
            throw new BaseException(ErrorCode.TOKEN_INVALID);
        }
        return email;
    }

    /** Parses and validates the roles claim from the token */
    private List<String> extractRoles(DecodedJWT jwt) {
        List<String> roles = jwt.getClaim(AppConstants.JwtClaims.ROLES).asList(String.class);
        if (roles == null || roles.isEmpty()) {
            log.error(MessageConstants.Jwt.CLAIM_EMPTY_LIST, AppConstants.JwtClaims.ROLES);
            throw new BaseException(ErrorCode.TOKEN_INVALID);
        }
        return roles;
    }

    /** Parses and validates the token type claim from the token */
    private TokenType extractTokenType(DecodedJWT jwt) {
        String type = jwt.getClaim(AppConstants.JwtClaims.TYPE).asString();
        if (type == null || type.isBlank()) {
            log.error(MessageConstants.Jwt.CLAIM_MISSING, AppConstants.JwtClaims.TYPE);
            throw new BaseException(ErrorCode.TOKEN_INVALID);
        }
        try {
            return TokenType.valueOf(type);
        } catch (IllegalArgumentException e) {
            log.error(MessageConstants.Jwt.TOKEN_TYPE_INVALID, type);
            throw new BaseException(ErrorCode.TOKEN_INVALID);
        }
    }
}