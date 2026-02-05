package com.bo.caresync.dto.request.auth;

import lombok.Getter;
import lombok.Setter;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/3/2026, 7:06 PM,
 **/
@Getter
@Setter
public class RegisterRequest {
    private String email;
    private String password;
    private String fullName;
    private String phoneNumber;
}