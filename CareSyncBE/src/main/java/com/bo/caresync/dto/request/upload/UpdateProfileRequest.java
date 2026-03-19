package com.bo.caresync.dto.request.upload;

import lombok.Getter;
import lombok.Setter;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 3/19/2026, 5:21 PM,
 **/
@Getter
@Setter
public class UpdateProfileRequest {
    private String fullName;
    private String phoneNumber;
    private String profileImageUrl;
}