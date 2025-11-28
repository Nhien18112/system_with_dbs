package com.project.happy.service.scheduling;

import java.time.LocalDateTime;
import java.util.List;

import com.project.happy.dto.freeslot.FreeSlotResponse;
import com.project.happy.entity.Appointment;
import com.project.happy.entity.Meeting;

public interface IStudentSchedulingService {

    // ---------------- Appointment Operations ----------------

    boolean bookAppointment(Long studentId, Long tutorId, LocalDateTime date, LocalDateTime startTime, LocalDateTime endTime, String topic);

    List<Appointment> viewOfficialAppointments(Long studentId);
    
    List<Meeting> viewOfficialMeetings(Long studentId);

    List<Appointment> viewAppointmentHistory(Long studentId);
    List<Appointment> findApprovedAppointments(Long studentId);
    List<Appointment> findCancellableAppointmentByStudent(Long studentId);

    boolean cancelMeeting(Long meetingId, String reason);

    // ---------------- Helper / Optional ----------------

    List<Appointment> findCancellableAppointment(Long studentId);

    List<FreeSlotResponse> viewTutorAvailableSlots(Long tutorId);

    List<Meeting> findCancellableMeetings(Long studentId);
    
    //boolean checkTutorSlotAvailability(int tutorId, LocalDateTime date, LocalDateTime start, LocalDateTime end);

    Meeting viewMeetingDetails(Long meetingId);

}
