package com.project.happy.facade;

import com.project.happy.entity.TutorRegistrationEntity;
import com.project.happy.service.tutor.ITutorRegistrationService;
import com.project.happy.service.tutor.MatchingEngine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

/**
 * Facade for TutorRegistration operations
 * Orchestrates service layer to provide high-level API to controllers
 * Only depends on ITutorRegistrationService interface
 */
@Component
public class TutorRegistrationFacade {

    private static final Logger logger = LoggerFactory.getLogger(TutorRegistrationFacade.class);
    private final ITutorRegistrationService registrationService;

    @Autowired
    public TutorRegistrationFacade(ITutorRegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    public List<MatchingEngine.TutorSuggestion> suggestTutors(String subject) {
        return registrationService.suggestTutors(subject);
    }

    public TutorRegistrationEntity createRegistration(Integer studentId, Integer subjectId, Integer tutorId) {
        logger.info("📝 Creating tutor registration - studentId: {}, subjectId: {}, tutorId: {}", studentId, subjectId, tutorId);
        try {
            TutorRegistrationEntity result = registrationService.createRequest(studentId, subjectId, tutorId);
            logger.info("✅ Registration created successfully - id: {}, status: {}", result.getId(), result.getStatus());
            return result;
        } catch (Exception e) {
            logger.error("❌ Failed to create registration", e);
            throw e;
        }
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

    public List<TutorRegistrationEntity> getStudentRegistrations(Integer studentId) {
        return registrationService.getByStudentId(studentId);
    }
}
