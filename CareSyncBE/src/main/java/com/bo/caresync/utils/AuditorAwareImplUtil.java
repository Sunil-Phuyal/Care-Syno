package com.bo.caresync.utils;


import com.bo.caresync.constant.AppConstants;
import com.bo.caresync.constant.MessageConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 1/31/2026, 5:52 PM
 **/
@Slf4j
@Service
@RequiredArgsConstructor
public class AuditorAwareImplUtil implements AuditorAware<String> {
    private final String className = this.getClass().getSimpleName();

    @Override
    public Optional<String> getCurrentAuditor() {
        String methodName = AppUtil.getMethodName();
        String urn = UUID.randomUUID().toString();
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null ||
                    !authentication.isAuthenticated() ||
                    authentication instanceof AnonymousAuthenticationToken) {
                return Optional.of(AppConstants.Auditor.SYSTEM_USER);
            }
            Object principal = authentication.getPrincipal();

            if (principal instanceof UserDetails) {
                String username = ((UserDetails) principal).getUsername();
                return Optional.ofNullable(username).filter(u -> !u.isBlank())
                        .or(() -> Optional.of(AppConstants.Auditor.SYSTEM_USER));
            }
            if (principal instanceof String) {
                String username = (String) principal;
                return username.isBlank() ? Optional.of(AppConstants.Auditor.SYSTEM_USER) : Optional.of(username);
            }
            if (principal != null) {
                try {
                    String name = principal.toString();
                    if (name != null && !name.isBlank() && !name.equals(AppConstants.Auditor.ANONYMOUS_USER)) {
                        return Optional.of(name);
                    }
                } catch (Exception e) {
                    log.error(urn, className, methodName, MessageConstants.Auditor.PRINCIPAL_EXTRACTION_FAILED,
                            principal.getClass().getName());
                }
            }
            log.info(urn, className, methodName, MessageConstants.Auditor.UNKNOWN_PRINCIPAL_TYPE, null);
            return Optional.of(AppConstants.Auditor.SYSTEM_USER);
        } catch (Exception e) {
            log.error(urn, className, methodName, MessageConstants.Auditor.ERROR, e.getMessage());
            return Optional.of(AppConstants.Auditor.SYSTEM_USER);
        }
    }
}