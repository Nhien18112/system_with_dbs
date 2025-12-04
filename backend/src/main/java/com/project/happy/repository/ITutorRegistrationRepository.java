package com.project.happy.repository;

import com.project.happy.entity.TutorRegistrationEntity;
import com.project.happy.entity.TutorRegistrationStatus;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * Interface for TutorRegistration repository operations
 */
public interface ITutorRegistrationRepository {

    /**
     * Save or update a tutor registration entity
     * @param entity the entity to save
     * @return the saved entity
     */
    TutorRegistrationEntity save(TutorRegistrationEntity entity);

    /**
     * Find a tutor registration by id
     * @param id the registration id
     * @return Optional containing the entity if found
     */
    Optional<TutorRegistrationEntity> findById(Long id);

    /**
     * Find all registrations with a specific status
     * @param status the registration status
     * @return list of registrations
     */
    List<TutorRegistrationEntity> findByStatus(TutorRegistrationStatus status);

    /**
     * Find registrations by student id and status
     * @param studentId the student id
     * @param status the registration status
     * @return list of registrations
     */
    List<TutorRegistrationEntity> findByStudentIdAndStatus(Integer studentId, TutorRegistrationStatus status);

    /**
     * Find registrations with status and request time before cutoff
     * @param status the registration status
     * @param cutoff the cutoff datetime
     * @return list of registrations
     */
    List<TutorRegistrationEntity> findByStatusAndRequestTimeBefore(TutorRegistrationStatus status, LocalDateTime cutoff);

    /**
     * Check if a registration exists for a student with given statuses
     * @param studentId the student id
     * @param statuses the collection of statuses
     * @return true if exists, false otherwise
     */
    boolean existsByStudentIdAndStatusIn(Integer studentId, Collection<TutorRegistrationStatus> statuses);

    /**
     * Delete a registration by id
     * @param id the registration id
     */
    void deleteById(Long id);

    /**
     * Find registrations by tutor id and status
     * @param tutorId tutor id
     * @param status status
     */
    List<TutorRegistrationEntity> findByTutorIdAndStatus(Integer tutorId, TutorRegistrationStatus status);
}
