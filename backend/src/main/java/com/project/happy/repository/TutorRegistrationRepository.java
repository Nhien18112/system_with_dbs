package com.project.happy.repository;

import com.project.happy.entity.TutorRegistrationEntity;
import com.project.happy.entity.TutorRegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * Spring Data JPA Repository for TutorRegistrationEntity
 * Provides database access operations
 */
@Repository
public interface TutorRegistrationRepository extends JpaRepository<TutorRegistrationEntity, Long> {

    List<TutorRegistrationEntity> findByStatus(TutorRegistrationStatus status);

    List<TutorRegistrationEntity> findByStudentIdAndStatus(String studentId, TutorRegistrationStatus status);

    @Query("select t from TutorRegistrationEntity t where t.status = :status and t.requestTime <= :cutoff")
    List<TutorRegistrationEntity> findByStatusAndRequestTimeBefore(@Param("status") TutorRegistrationStatus status, @Param("cutoff") LocalDateTime cutoff);

    boolean existsByStudentIdAndStatusIn(String studentId, Collection<TutorRegistrationStatus> statuses);
}
