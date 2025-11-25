package com.project.happy.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final MockSSOAuthenticationFilter mockSSOAuthenticationFilter;
    private final RegistrationEnforcementFilter registrationEnforcementFilter;

    @Autowired
    public SecurityConfig(MockSSOAuthenticationFilter mockSSOAuthenticationFilter, RegistrationEnforcementFilter registrationEnforcementFilter) {
        this.mockSSOAuthenticationFilter = mockSSOAuthenticationFilter;
        this.registrationEnforcementFilter = registrationEnforcementFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // explicitly permit POST/GET to registration API to avoid method-specific blocking
                .requestMatchers(HttpMethod.POST, "/api/tutor-registration/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/tutor-registration/**").permitAll()
                .requestMatchers("/register-tutor", "/dashboard", "/").permitAll()
                .anyRequest().authenticated()
            )
            // Allow anonymous access explicitly for public endpoints (no challenge)
            .anonymous(Customizer.withDefaults());

        // Add mock SSO filter before Spring Security's authentication
        http.addFilterBefore(mockSSOAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        // Then add enforcement filter
        http.addFilterAfter(registrationEnforcementFilter, MockSSOAuthenticationFilter.class);

        return http.build();
    }
}
