package com.project.happy.repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.project.happy.entity.TutorRegistrationEntity;
import com.project.happy.entity.TutorRegistrationStatus;

/**
 * Adapter class implementing ITutorRegistrationRepository interface
 * Uses TutorRegistrationRepository (Spring Data JPA) as the underlying data access layer
 */
@Component
public class TutorRegistrationRepositoryAdapter implements ITutorRegistrationRepository {

    private final TutorRegistrationRepository jpaRepository;

    @Autowired
    public TutorRegistrationRepositoryAdapter(TutorRegistrationRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public TutorRegistrationEntity save(TutorRegistrationEntity entity) {
        return jpaRepository.save(entity);
    }

    @Override
    public Optional<TutorRegistrationEntity> findById(Long id) {
        return jpaRepository.findById(id);
    }

    @Override
    public List<TutorRegistrationEntity> findByStatus(TutorRegistrationStatus status) {
        return jpaRepository.findByStatus(status);
    }

    @Override
    public List<TutorRegistrationEntity> findByStudentIdAndStatus(Integer studentId, TutorRegistrationStatus status) {
        return jpaRepository.findByStudentIdAndStatus(studentId, status);
    }

    @Override
    public List<TutorRegistrationEntity> findByStatusAndRequestTimeBefore(TutorRegistrationStatus status, LocalDateTime cutoff) {
        return jpaRepository.findByStatusAndRequestTimeBefore(status, cutoff);
    }

    @Override
    public boolean existsByStudentIdAndStatusIn(Integer studentId, Collection<TutorRegistrationStatus> statuses) {
        return jpaRepository.existsByStudentIdAndStatusIn(studentId, statuses);
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public List<TutorRegistrationEntity> findByTutorIdAndStatus(Integer tutorId, TutorRegistrationStatus status) {
        return jpaRepository.findByTutorIdAndStatus(tutorId, status);
    }

    @Override
    public List<TutorRegistrationEntity> findByStudentId(Integer studentId) {
        return jpaRepository.findByStudentId(studentId);
    }
}