package com.bo.caresync.dto.request.auth;

import lombok.Getter;
import lombok.Setter;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 4/4/2026, 11:24 AM,
 **/
@Getter
@Setter
public class AcceptInviteRequest {
    private String token;
    private String password;
    private String confirmPassword;
    private String phoneNumber;
}