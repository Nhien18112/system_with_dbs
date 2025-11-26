package com.project.happy.entity;

import java.time.LocalDateTime;
public class Appointment extends Meeting {

    private Long studentId;
    private AppointmentStatus appointmentStatus;

    public Appointment(Long meetingId, Long tutorId, Long studentId,
                       LocalDateTime date, LocalDateTime startTime,
                       LocalDateTime endTime, String topic) {
        super(meetingId, tutorId, date, startTime, endTime, topic, MeetingType.APPOINTMENT);
        this.studentId = studentId;
        this.appointmentStatus = AppointmentStatus.PENDING;
    }

    public boolean approve() {
        if (appointmentStatus != AppointmentStatus.PENDING) return false;
        appointmentStatus = AppointmentStatus.APPROVED;
        return true;
    }

    public boolean reject() {
        if (appointmentStatus != AppointmentStatus.PENDING) return false;
        appointmentStatus = AppointmentStatus.REJECTED;
        return true;
    }

    // Getters & Setters
    public Long getStudentId() { return studentId; }
    public AppointmentStatus getAppointmentStatus() { return appointmentStatus; }
    public void setAppointmentStatus(AppointmentStatus status) { this.appointmentStatus = status; }
}