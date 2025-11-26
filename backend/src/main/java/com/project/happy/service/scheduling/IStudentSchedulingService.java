package com.project.happy.service.scheduling;

import com.project.happy.entity.Appointment;
import com.project.happy.entity.Meeting;
//import com.project.happy.util.AvailableSlot;

import java.time.LocalDateTime;
import java.util.List;

public interface IStudentSchedulingService {

    // ---------------- Appointment Operations ----------------

    boolean bookAppointment(int studentId, int tutorId, LocalDateTime date, LocalDateTime startTime, String topic);

    List<Appointment> findApprovedAppointments(int studentId);

    List<Appointment> viewAppointmentHistory(int studentId);

    boolean cancelMeeting(int studentId, int meetingId, String reason);

    // ---------------- Helper / Optional ----------------

    List<Meeting> findCancellableMeetings(int studentId);

    //List<AvailableSlot> viewTutorAvailableSlots(int tutorId);

    boolean checkTutorSlotAvailability(int tutorId, LocalDateTime date, LocalDateTime start, LocalDateTime end);

    Meeting viewMeetingDetails(int meetingId);
}
