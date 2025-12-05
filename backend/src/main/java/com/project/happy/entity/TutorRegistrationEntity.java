package com.project.happy.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tutor_registrations")
public class TutorRegistrationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "registration_id")
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Integer studentId;

    @Column(name = "tutor_id")
    private Integer tutorId;

    @Column(name = "subject_id", nullable = false)
    private Integer subjectId;

    @Enumerated(EnumType.STRING)
    @Column(name = "registration_status", nullable = false)
    private TutorRegistrationStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime requestTime;
    
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    public TutorRegistrationEntity() {}

    public TutorRegistrationEntity(Integer studentId, Integer tutorId, Integer subjectId, TutorRegistrationStatus status, LocalDateTime requestTime) {
        this.studentId = studentId;
        this.tutorId = tutorId;
        this.subjectId = subjectId;
        this.status = status;
        this.requestTime = requestTime;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getStudentId() {
        return studentId;
    }

    public void setStudentId(Integer studentId) {
        this.studentId = studentId;
    }

    public Integer getTutorId() {
        return tutorId;
    }

    public void setTutorId(Integer tutorId) {
        this.tutorId = tutorId;
    }

    public Integer getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Integer subjectId) {
        this.subjectId = subjectId;
    }

    public TutorRegistrationStatus getStatus() {
        return status;
    }

    public void setStatus(TutorRegistrationStatus status) {
        this.status = status;
    }

    public LocalDateTime getRequestTime() {
        return requestTime;
    }

    public void setRequestTime(LocalDateTime requestTime) {
        this.requestTime = requestTime;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    @Override
    public String toString() {
        return "TutorRegistrationEntity{" +
                "id=" + id +
                ", studentId=" + studentId +
                ", tutorId=" + tutorId +
                ", subjectId=" + subjectId +
                ", status=" + status +
                ", requestTime=" + requestTime +
                ", approvedAt=" + approvedAt +
                '}';
    }
}
