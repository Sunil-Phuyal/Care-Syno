package com.bo.caresync.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/3/2026, 7:35 PM,
 **/
@Getter
@Setter
public class UserResponse {
    private Long userId;
    private String email;
    private String fullName;
    private String phoneNumber;
    private Boolean isEmailVerified;
    private List<String> roles;
}
