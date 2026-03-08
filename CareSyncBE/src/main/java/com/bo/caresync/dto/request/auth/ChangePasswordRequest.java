package com.bo.caresync.dto.request.auth;

import lombok.Getter;
import lombok.Setter;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 3/8/2026, 11:59 AM,
 **/
@Getter
@Setter
public class ChangePasswordRequest {
    private String currentPassword;
    private String newPassword;
    private String confirmPassword;
}