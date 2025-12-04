package com.project.happy.service.tutor;

import com.project.happy.entity.TutorRegistrationEntity;
import com.project.happy.entity.TutorRegistrationStatus;
import com.project.happy.repository.ITutorRegistrationRepository;
import com.project.happy.repository.UserRepository;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Implementation of ITutorRegistrationService
 * Provides business logic for managing tutor registrations
 * Depends on ITutorRegistrationRepository for data access and MatchingEngine for tutor matching
 */
@Service
public class TutorRegistrationService implements ITutorRegistrationService {

    private final ITutorRegistrationRepository repository;
    private final MatchingEngine matchingEngine;
    private final UserRepository userRepository;

    @Autowired
    public TutorRegistrationService(ITutorRegistrationRepository repository, MatchingEngine matchingEngine, UserRepository userRepository) {
        this.repository = repository;
        this.matchingEngine = matchingEngine;
        this.userRepository = userRepository;
    }

    @Transactional
    public TutorRegistrationEntity createRequest(Integer studentId, Integer subjectId, Integer tutorId) {
        // Validate roles in DB before inserting to avoid DB trigger errors
        userRepository.findById(studentId).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student not found"));
        String studentRole = userRepository.findById(studentId).get().getRole();
        if (!"STUDENT".equalsIgnoreCase(studentRole)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a student");
        }

        userRepository.findById(tutorId).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tutor not found"));
        String tutorRole = userRepository.findById(tutorId).get().getRole();
        if (!"TUTOR".equalsIgnoreCase(tutorRole)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a tutor");
        }

        TutorRegistrationEntity entity = new TutorRegistrationEntity();
        entity.setStudentId(studentId);
        entity.setSubjectId(subjectId);
        entity.setTutorId(tutorId);
        // Set status to PENDING initially - will be auto-approved by scheduler after 12 hours
        entity.setStatus(TutorRegistrationStatus.PENDING);
        entity.setRequestTime(LocalDateTime.now());
        // Set a default expiry time (12 hours from request) for auto-approval
        entity.setExpiresAt(LocalDateTime.now().plusHours(12));
        // Save the registration first (PENDING status)
        TutorRegistrationEntity saved = repository.save(entity);
        
        // Immediately approve the registration to trigger the database UPDATE trigger
        // which will increment tutor's current_slots
        saved.setStatus(TutorRegistrationStatus.APPROVED);
        saved.setApprovedAt(LocalDateTime.now());
        saved = repository.save(saved);
        
        return saved;
    }

    @Transactional
    public boolean cancelRequest(Long registrationId, Integer studentId) {
        Optional<TutorRegistrationEntity> opt = repository.findById(registrationId);
        if (opt.isEmpty()) return false;
        TutorRegistrationEntity r = opt.get();
        if (!r.getStudentId().equals(studentId)) return false;
        if (r.getStatus() == TutorRegistrationStatus.PENDING || r.getStatus() == TutorRegistrationStatus.CREATING) {
            r.setStatus(TutorRegistrationStatus.CANCELLED);
            repository.save(r);
            return true;
        }
        return false;
    }

    public List<TutorRegistrationEntity> findPendingOlderThan(LocalDateTime cutoff) {
        return repository.findByStatusAndRequestTimeBefore(TutorRegistrationStatus.PENDING, cutoff);
    }

    @Transactional
    public void approveRegistration(TutorRegistrationEntity registration) {
        registration.setStatus(TutorRegistrationStatus.APPROVED);
        repository.save(registration);
    }

    public List<MatchingEngine.TutorSuggestion> suggestTutors(String subject) {
        return matchingEngine.suggestTutors(subject);
    }

    @Override
    public List<TutorRegistrationEntity> getPendingRegistrations(Integer tutorId) {
        return repository.findByTutorIdAndStatus(tutorId, TutorRegistrationStatus.PENDING);
    }

    @Override
    public List<TutorRegistrationEntity> getApprovedStudents(Integer tutorId) {
        return repository.findByTutorIdAndStatus(tutorId, TutorRegistrationStatus.APPROVED);
    }

    @Override
    @Transactional
    public boolean approveById(Long registrationId, Integer tutorId) {
        Optional<TutorRegistrationEntity> opt = repository.findById(registrationId);
        if (opt.isEmpty()) return false;
        TutorRegistrationEntity r = opt.get();
        if (r.getTutorId() == null || !r.getTutorId().equals(tutorId)) return false;
        r.setStatus(TutorRegistrationStatus.APPROVED);
        r.setApprovedAt(LocalDateTime.now());
        repository.save(r);
        return true;
    }

    @Override
    @Transactional
    public boolean rejectById(Long registrationId, Integer tutorId, String reason) {
        Optional<TutorRegistrationEntity> opt = repository.findById(registrationId);
        if (opt.isEmpty()) return false;
        TutorRegistrationEntity r = opt.get();
        if (r.getTutorId() == null || !r.getTutorId().equals(tutorId)) return false;
        r.setStatus(TutorRegistrationStatus.REJECTED);
        r.setReasonForRejection(reason);
        repository.save(r);
        return true;
    }

    @Override
    public List<TutorRegistrationEntity> getByStudentId(Integer studentId) {
        return repository.findByStudentId(studentId);
    }
}
