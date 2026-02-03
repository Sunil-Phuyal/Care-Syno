package com.bo.caresync.dto.request.auth;

import lombok.Getter;
import lombok.Setter;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/3/2026, 6:56 PM,
 **/
@Getter
@Setter
public class LoginRequest {
    private String email;
    private String password;
}