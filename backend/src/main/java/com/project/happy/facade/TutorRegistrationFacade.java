package com.project.happy.facade;

import com.project.happy.entity.TutorRegistrationEntity;
import com.project.happy.service.tutor.ITutorRegistrationService;
import com.project.happy.service.tutor.MatchingEngine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Facade for TutorRegistration operations
 * Orchestrates service layer to provide high-level API to controllers
 * Only depends on ITutorRegistrationService interface
 */
@Component
public class TutorRegistrationFacade {

    private final ITutorRegistrationService registrationService;

    @Autowired
    public TutorRegistrationFacade(ITutorRegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    public List<MatchingEngine.TutorSuggestion> suggestTutors(String subject) {
        return registrationService.suggestTutors(subject);
    }

    public TutorRegistrationEntity createRegistration(Integer studentId, Integer subjectId, Integer tutorId) {
        // Could add extra validation (is registration open, student eligibility, etc.)
        return registrationService.createRequest(studentId, subjectId, tutorId);
    }

    public boolean cancel(Long registrationId, Integer studentId) {
        return registrationService.cancelRequest(registrationId, studentId);
    }

    public java.util.List<TutorRegistrationEntity> getPendingRegistrations(Integer tutorId) {
        return registrationService.getPendingRegistrations(tutorId);
    }

    public java.util.List<TutorRegistrationEntity> getApprovedStudents(Integer tutorId) {
        return registrationService.getApprovedStudents(tutorId);
    }

    public boolean approve(Long registrationId, Integer tutorId) {
        return registrationService.approveById(registrationId, tutorId);
    }

    public boolean reject(Long registrationId, Integer tutorId, String reason) {
        return registrationService.rejectById(registrationId, tutorId, reason);
    }
}
