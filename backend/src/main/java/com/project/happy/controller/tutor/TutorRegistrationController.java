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

    public static record RegisterRequest(@jakarta.validation.constraints.NotNull Integer studentId, @jakarta.validation.constraints.NotNull Integer subjectId, Integer tutorId) {}

    @PostMapping("/register-tutor")
    public ResponseEntity<?> registerTutor(@Valid @RequestBody RegisterRequest request) {
        TutorRegistrationEntity saved = facade.createRegistration(request.studentId(), request.subjectId(), request.tutorId());
        return ResponseEntity.ok(Map.of("registrationId", saved.getId(), "status", saved.getStatus()));
    }

    public static record CancelRequest(Long registrationId, @jakarta.validation.constraints.NotNull Integer studentId) {}

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

    // DTO used for responses
    public static record RegistrationDto(Long id, Integer studentId, Integer tutorId, Integer subjectId, String registrationStatus, String createdAt, String approvedAt, String reasonForRejection) {}

    @GetMapping("/pending-registrations")
    public ResponseEntity<?> getPendingRegistrations(@RequestParam Integer tutorId) {
        List<TutorRegistrationEntity> regs = facade.getPendingRegistrations(tutorId);
        var dtos = regs.stream().map(r -> new RegistrationDto(
                r.getId(), r.getStudentId(), r.getTutorId(), r.getSubjectId(), r.getStatus().name(),
                r.getRequestTime() != null ? r.getRequestTime().toString() : null,
                r.getApprovedAt() != null ? r.getApprovedAt().toString() : null,
                r.getReasonForRejection()
        )).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/approved-students")
    public ResponseEntity<?> getApprovedStudents(@RequestParam Integer tutorId) {
        List<TutorRegistrationEntity> regs = facade.getApprovedStudents(tutorId);
        var dtos = regs.stream().map(r -> new RegistrationDto(
                r.getId(), r.getStudentId(), r.getTutorId(), r.getSubjectId(), r.getStatus().name(),
                r.getRequestTime() != null ? r.getRequestTime().toString() : null,
                r.getApprovedAt() != null ? r.getApprovedAt().toString() : null,
                r.getReasonForRejection()
        )).toList();
        return ResponseEntity.ok(dtos);
    }

    public static record ApproveRequest(@jakarta.validation.constraints.NotNull Integer tutorId) {}

    @PostMapping("/{registrationId}/approve")
    public ResponseEntity<?> approveRegistration(@PathVariable Long registrationId, @RequestBody ApproveRequest request) {
        boolean ok = facade.approve(registrationId, request.tutorId());
        if (ok) return ResponseEntity.ok(Map.of("result", "approved"));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Không thể phê duyệt (không tồn tại hoặc quyền)"));
    }

    public static record RejectRequest(@jakarta.validation.constraints.NotNull Integer tutorId, String reason) {}

    @PostMapping("/{registrationId}/reject")
    public ResponseEntity<?> rejectRegistration(@PathVariable Long registrationId, @RequestBody RejectRequest request) {
        boolean ok = facade.reject(registrationId, request.tutorId(), request.reason());
        if (ok) return ResponseEntity.ok(Map.of("result", "rejected"));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Không thể từ chối (không tồn tại hoặc quyền)"));
    }
}
