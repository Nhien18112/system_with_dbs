package com.project.happy.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    // 1. Khai báo biến
    private final MockSSOAuthenticationFilter mockSSOAuthenticationFilter;
    private final RegistrationEnforcementFilter registrationEnforcementFilter;

    // 2. Constructor
    @Autowired
    public SecurityConfig(MockSSOAuthenticationFilter mockSSOAuthenticationFilter, 
                          RegistrationEnforcementFilter registrationEnforcementFilter) {
        this.mockSSOAuthenticationFilter = mockSSOAuthenticationFilter;
        this.registrationEnforcementFilter = registrationEnforcementFilter;
    }

    // 3. Cấu hình bảo mật
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // --- MỞ KHÓA ĐỂ TEST ---
                .requestMatchers("/freeslots/**").permitAll()     // 1. API Lịch rảnh
                .requestMatchers("/api/student/scheduling/**").permitAll() // 2. API Đặt lịch (MỚI THÊM)
                // -----------------------

                // Các dòng cũ của nhóm
                .requestMatchers(HttpMethod.POST, "/api/tutor-registration/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/tutor-registration/**").permitAll()
                .requestMatchers("/register-tutor", "/dashboard", "/").permitAll()
                
                // Tất cả cái khác phải đăng nhập
                .anyRequest().authenticated()
            )
            .anonymous(Customizer.withDefaults());

        // Thêm các bộ lọc
        http.addFilterBefore(mockSSOAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterAfter(registrationEnforcementFilter, MockSSOAuthenticationFilter.class);

        return http.build();
    }
}