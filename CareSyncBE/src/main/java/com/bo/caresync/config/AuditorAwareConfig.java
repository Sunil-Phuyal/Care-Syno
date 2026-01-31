package com.bo.caresync.config;

import com.bo.caresync.utils.AuditorAwareImplUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 1/31/2026, 6:22 PM,
 **/
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
@RequiredArgsConstructor
public class AuditorAwareConfig {
    private final AuditorAwareImplUtil auditorAwareImplUtil;

    @Bean
    public AuditorAware<String> auditorProvider(){
        return auditorAwareImplUtil;
    }
}