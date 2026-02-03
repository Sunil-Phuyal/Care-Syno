package com.bo.caresync.dto.request.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/3/2026, 7:30 PM,
 **/
@Getter
@Setter
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private Long userId;
    private String email;
    private String fullName;
    private List<String> roles;
}
