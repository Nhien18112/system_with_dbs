package com.project.happy.service.scheduling;

import com.project.happy.entity.Appointment;
import com.project.happy.entity.Meeting;

import java.time.LocalDateTime;
import java.util.List;

public interface ITutorSchedulingService {

    // Tutor operations
    List<Appointment> viewPendingAppointments(int tutorId);

    String approveAppointment(int appointmentId, int tutorId);  // trả về onlineLink nếu online

    boolean rejectAppointment(int appointmentId, int tutorId);

    List<Appointment> viewApprovedAppointments(int tutorId);

    boolean cancelMeeting(int tutorId, int meetingId, String reason);

    // Optional / helper
    List<Appointment> findPendingAppointmentsByTutor(int tutorId);

    List<Appointment> findApprovedAppointmentsByTutor(int tutorId);

    boolean validateScheduleConflict(int tutorId, LocalDateTime start, LocalDateTime end);

    Meeting viewMeetingDetails(int meetingId);

    String createOnlineLink(Appointment appointment);
}
