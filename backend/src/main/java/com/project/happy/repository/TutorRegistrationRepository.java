package com.project.happy.repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.happy.entity.TutorRegistrationEntity;
import com.project.happy.entity.TutorRegistrationStatus;

/**
 * Spring Data JPA Repository for TutorRegistrationEntity
 * Provides database access operations
 */
@Repository
public interface TutorRegistrationRepository extends JpaRepository<TutorRegistrationEntity, Long> {

    List<TutorRegistrationEntity> findByStatus(TutorRegistrationStatus status);

    List<TutorRegistrationEntity> findByStudentIdAndStatus(Integer studentId, TutorRegistrationStatus status);

    @Query("select t from TutorRegistrationEntity t where t.status = :status and t.requestTime <= :cutoff")
    List<TutorRegistrationEntity> findByStatusAndRequestTimeBefore(@Param("status") TutorRegistrationStatus status, @Param("cutoff") LocalDateTime cutoff);

    boolean existsByStudentIdAndStatusIn(Integer studentId, Collection<TutorRegistrationStatus> statuses);
    
    /**
     * Find registrations by tutor id and status
     */
    List<TutorRegistrationEntity> findByTutorIdAndStatus(Integer tutorId, TutorRegistrationStatus status);

    /**
     * Find all registrations by student id
     */
    List<TutorRegistrationEntity> findByStudentId(Integer studentId);
}