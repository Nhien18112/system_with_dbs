package com.project.happy.repository;

import com.project.happy.entity.Appointment;
import com.project.happy.entity.Meeting;

import java.util.List;

public interface IMeetingRepository {

    // Basic CRUD-like operations
    Meeting findById(Long meetingId);
    void save(Meeting meeting);
    void update(Meeting meeting);

    // Tutor-specific queries
    List<Appointment> findPendingAppointmentsByTutor(Long tutorId);
    List<Appointment> findApprovedAppointmentsByTutor(Long tutorId);
    List<Appointment> findOfficialAppointmentsByTutor(Long tutorId);

    // Student-specific queries
    List<Appointment> findAllAppointmentsByStudent(Long studentId);    // all appointments, any status
    List<Appointment> findApprovedAppointmentsByStudent(Long studentId);
    List<Appointment> findOfficialAppointmentsByStudent(Long studentId);

    // Common / Helper
    List<Appointment> findCancellableAppointmentsByTutor(Long tutorId);
    List<Appointment> findCancellableAppointmentsByStudent(Long studentId);
    
}