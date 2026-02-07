package com.bo.caresync.dto.request.email;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/7/2026, 1:15 PM,
 **/
@Getter
@Setter
@Builder
public class EmailRequest {
    private String to;
    private String subject;
    private String body;
    private boolean isHtml;
    private Map<String, Object> templateData;
}