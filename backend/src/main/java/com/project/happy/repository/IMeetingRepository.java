package com.project.happy.repository;

import java.util.List;
import com.project.happy.entity.Appointment;
import com.project.happy.entity.Meeting;

public interface IMeetingRepository {

    Meeting findById(Long meetingId);

    void save(Meeting meeting);

    void update(Meeting meeting);

    // Tutor-specific queries
    List<Appointment> findPendingAppointmentsByTutor(Long tutorId);

    List<Appointment> findApprovedAppointmentsByTutor(Long tutorId);

    // Student-specific queries
    List<Appointment> findAllAppointmentsByStudent(Long studentId);

    List<Appointment> findApprovedAppointmentsByStudent(Long studentId);

    List<Meeting> findApprovedMeetingByStudent(Long studentId);

    List<Meeting> findApprovedMeetingByTutor(Long tutorId);

    List<Meeting> findOfficialMeetingsByStudent(Long studentId);

    List<Meeting> findOfficialMeetingsByTutor(Long tutorId);
}
