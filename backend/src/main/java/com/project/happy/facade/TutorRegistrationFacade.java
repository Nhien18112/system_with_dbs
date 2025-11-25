package com.project.happy.facade;

import com.project.happy.entity.TutorRegistrationEntity;
import com.project.happy.service.tutor.MatchingEngine;
import com.project.happy.service.tutor.TutorRegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TutorRegistrationFacade {

    private final MatchingEngine matchingEngine;
    private final TutorRegistrationService registrationService;

    @Autowired
    public TutorRegistrationFacade(MatchingEngine matchingEngine, TutorRegistrationService registrationService) {
        this.matchingEngine = matchingEngine;
        this.registrationService = registrationService;
    }

    public List<MatchingEngine.TutorSuggestion> suggestTutors(String subject) {
        return matchingEngine.suggestTutors(subject);
    }

    public TutorRegistrationEntity createRegistration(String studentId, String subject, String tutorId) {
        // Could add extra validation (is registration open, student eligibility, etc.)
        return registrationService.createRequest(studentId, subject, tutorId);
    }

    public boolean cancel(Long registrationId, String studentId) {
        return registrationService.cancelRequest(registrationId, studentId);
    }
}
