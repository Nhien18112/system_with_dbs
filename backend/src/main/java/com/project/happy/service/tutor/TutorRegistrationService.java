package com.project.happy.service.tutor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.project.happy.entity.TutorRegistrationEntity;
import com.project.happy.entity.TutorRegistrationStatus;
import com.project.happy.repository.ITutorRegistrationRepository;
import com.project.happy.repository.UserRepository;

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

    @Override
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
        entity.setStatus(TutorRegistrationStatus.PENDING);
        entity.setRequestTime(LocalDateTime.now());
        // Set a default expiry time (7 days from request) to satisfy NOT NULL constraint
        entity.setExpiresAt(LocalDateTime.now().plusDays(7));
        return repository.save(entity);
    }

    @Override
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

    @Override
    public List<TutorRegistrationEntity> findPendingOlderThan(LocalDateTime cutoff) {
        return repository.findByStatusAndRequestTimeBefore(TutorRegistrationStatus.PENDING, cutoff);
    }

    @Override
    @Transactional
    public void approveRegistration(TutorRegistrationEntity registration) {
        registration.setStatus(TutorRegistrationStatus.APPROVED);
        repository.save(registration);
    }

    @Override
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
    public TutorRegistrationEntity getApprovedTutor(Integer studentId) {
        // Gọi hàm có sẵn trong Repository
        List<TutorRegistrationEntity> list = repository.findByStudentIdAndStatus(studentId, TutorRegistrationStatus.APPROVED);
        
        if (list.isEmpty()) {
            return null; // Hoặc throw Exception nếu muốn
        }
        
        return list.get(0);
    }
}