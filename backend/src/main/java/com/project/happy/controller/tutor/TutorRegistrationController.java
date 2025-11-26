package com.project.happy.controller.tutor;

import com.project.happy.entity.TutorRegistrationEntity;
import com.project.happy.facade.TutorRegistrationFacade;
import com.project.happy.service.tutor.MatchingEngine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tutor-registration")
@Validated
public class TutorRegistrationController {

    private final TutorRegistrationFacade facade;

    @Autowired
    public TutorRegistrationController(TutorRegistrationFacade facade) {
        this.facade = facade;
    }

    public static record RegisterRequest(@NotBlank String studentId, @NotBlank String subject, String tutorId) {}

    @PostMapping("/register-tutor")
    public ResponseEntity<?> registerTutor(@Valid @RequestBody RegisterRequest request) {
        try {
            TutorRegistrationEntity saved = facade.createRegistration(request.studentId(), request.subject(), request.tutorId());
            return ResponseEntity.ok(Map.of("registrationId", saved.getId(), "status", saved.getStatus()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Không lưu được dữ liệu, vui lòng thử lại"));
        }
    }

    public static record CancelRequest(Long registrationId, @NotBlank String studentId) {}

    @PostMapping("/cancel-registration")
    public ResponseEntity<?> cancelRegistration(@Valid @RequestBody CancelRequest request) {
        boolean ok = facade.cancel(request.registrationId(), request.studentId());
        if (ok) return ResponseEntity.ok(Map.of("result", "cancelled"));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Không thể hủy yêu cầu (không tồn tại hoặc quyền)"));
    }

    @GetMapping("/suggest")
    public ResponseEntity<?> suggestTutors(@RequestParam String subject) {
        List<MatchingEngine.TutorSuggestion> suggestions = facade.suggestTutors(subject);
        if (suggestions.isEmpty()) return ResponseEntity.ok(Map.of("message", "Không có tutor phù hợp"));
        return ResponseEntity.ok(suggestions);
    }
}
