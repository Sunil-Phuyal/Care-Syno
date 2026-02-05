package com.bo.caresync.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;

/**
 * @author Sunil Phuyal
 * @version v1.0
 * @project CareSyncBE
 * @since 2/4/2026, 11:12 PM,
 **/
@Configuration
public class NoOpUserDetailsService {

    @Bean
    public UserDetailsService userDetailsService() {
        // Empty in-memory user details manager
        // This prevents Spring Security from auto-generating a user
        return new InMemoryUserDetailsManager();
    }
}
