package com.project.happy.service.tutor;

import com.project.happy.entity.TutorRegistrationEntity;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Interface for TutorRegistration service operations
 * Defines business logic contracts for tutor registration management
 */
public interface ITutorRegistrationService {

    /**
     * Create a new tutor registration request
     * @param studentId the student id
     * @param subject the subject to learn
     * @param tutorId the tutor id
     * @return the created registration entity
     */
    TutorRegistrationEntity createRequest(Integer studentId, Integer subjectId, Integer tutorId);

    /**
     * Cancel an existing registration request
     * @param registrationId the registration id
     * @param studentId the student id (for authorization)
     * @return true if cancelled successfully, false otherwise
     */
    boolean cancelRequest(Long registrationId, Integer studentId);

    /**
     * Find pending registrations older than a specified cutoff time
     * @param cutoff the cutoff datetime
     * @return list of pending registrations
     */
    List<TutorRegistrationEntity> findPendingOlderThan(LocalDateTime cutoff);

    /**
     * Approve a registration request
     * @param registration the registration to approve
     */
    void approveRegistration(TutorRegistrationEntity registration);

    /**
     * Suggest tutors based on subject
     * @param subject the subject to find tutors for
     * @return list of tutor suggestions
     */
    List<MatchingEngine.TutorSuggestion> suggestTutors(String subject);

    List<TutorRegistrationEntity> getPendingRegistrations(Integer tutorId);

    List<TutorRegistrationEntity> getApprovedStudents(Integer tutorId);

    boolean approveById(Long registrationId, Integer tutorId);

    boolean rejectById(Long registrationId, Integer tutorId, String reason);

    /**
     * Get all tutor registrations for a specific student
     * @param studentId the student id
     * @return list of registrations for the student
     */
    List<TutorRegistrationEntity> getByStudentId(Integer studentId);
}
