package com.project.happy.repository;

import com.project.happy.entity.Appointment;
import com.project.happy.entity.Meeting;

import java.util.List;

public interface IMeetingRepository {

    // Basic CRUD-like operations
    Meeting findById(int meetingId);
    void save(Meeting meeting);
    void update(Meeting meeting);

    // Tutor-specific queries
    List<Appointment> findPendingAppointmentsByTutor(int tutorId);
    List<Appointment> findApprovedAppointmentsByTutor(int tutorId);

    // Student-specific queries
    List<Appointment> findAllAppointmentsByStudent(int studentId);    // all appointments, any status
    List<Appointment> findApprovedAppointmentsByStudent(int studentId);

    // Common / Helper
    List<Meeting> findCancellableMeetings(int userId);               // meetings that can be cancelled
}