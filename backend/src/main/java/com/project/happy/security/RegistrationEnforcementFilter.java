package com.project.happy.security;

import com.project.happy.entity.TutorRegistrationStatus;
import com.project.happy.repository.TutorRegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RegistrationEnforcementFilter extends OncePerRequestFilter {

    private final TutorRegistrationRepository repository;

    @Autowired
    public RegistrationEnforcementFilter(TutorRegistrationRepository repository) {
        this.repository = repository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        // Only enforce for dashboard access or root
        if (path.startsWith("/dashboard") || path.equals("/") || path.equals("/home")) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                boolean isStudent = auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).anyMatch(r -> r.equalsIgnoreCase("ROLE_STUDENT") || r.equalsIgnoreCase("STUDENT"));
                if (isStudent) {
                    String studentId = String.valueOf(auth.getPrincipal());
                    // student must have at least one registration in PENDING or APPROVED or CREATING
                    boolean has = repository.existsByStudentIdAndStatusIn(studentId, List.of(TutorRegistrationStatus.PENDING, TutorRegistrationStatus.APPROVED, TutorRegistrationStatus.CREATING));
                    if (!has) {
                        // redirect to registration page (frontend route)
                        response.sendRedirect("/register-tutor");
                        return;
                    }
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}
