package com.project.happy.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tutor_registrations")
public class TutorRegistrationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String studentId;

    @Column
    private String tutorId;

    @Column(nullable = false)
    private String subject;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TutorRegistrationStatus status;

    @Column(nullable = false)
    private LocalDateTime requestTime;

    public TutorRegistrationEntity() {}

    public TutorRegistrationEntity(String studentId, String tutorId, String subject, TutorRegistrationStatus status, LocalDateTime requestTime) {
        this.studentId = studentId;
        this.tutorId = tutorId;
        this.subject = subject;
        this.status = status;
        this.requestTime = requestTime;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getTutorId() {
        return tutorId;
    }

    public void setTutorId(String tutorId) {
        this.tutorId = tutorId;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
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
}
