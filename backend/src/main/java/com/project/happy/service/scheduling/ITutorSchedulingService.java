package com.project.happy.service.scheduling;

import java.util.List;

import com.project.happy.entity.Appointment;
import com.project.happy.entity.Meeting;


public interface ITutorSchedulingService {

    List<Appointment> viewPendingAppointments(Long tutorId);

    boolean approveAppointment(Long appointmentId, Long tutorId);

    boolean rejectAppointment(Long appointmentId, Long tutorId, String reason);
    List<Meeting> viewOfficialMeetings(Long tutorId);

    boolean cancelMeeting(Long tutorId, Long meetingId, String reason);
    boolean tutorReturnCancelledSlot(Long tutorID, Long meetingId);

   
    List<Meeting> findCancellableMeetings(Long tutorId);

    //List<Appointment> findApprovedAppointments(Long tutorId);

    //boolean validateScheduleConflict(Long tutorId, LocalDateTime start, LocalDateTime end);

    Meeting viewMeetingDetails(Long meetingId);

    String createOnlineLink(Appointment appointment);
}
