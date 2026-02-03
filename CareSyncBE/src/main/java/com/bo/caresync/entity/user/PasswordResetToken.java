package com.bo.caresync.entity.user;

import com.bo.caresync.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/3/2026, 12:44 PM,
 **/

@Getter
@Setter
@Entity
@Table(name = "password_reset_tokens", schema = "onboarding")
public class PasswordResetToken extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "token_id")
    private Long tokenId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "token")
    private String token;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "used_at")
    private LocalDateTime usedAt;
}