package com.bo.caresync.dto.request.auth;

import lombok.Getter;
import lombok.Setter;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 3/8/2026, 11:47 AM,
 **/
@Getter
@Setter
public class UpdateProfileRequest {
    private String fullName;
    private String phoneNumber;
}