package com.project.happy.service.scheduling;

import java.time.LocalDate;

import com.project.happy.entity.Appointment;
import com.project.happy.entity.Meeting;
import com.project.happy.entity.TutorSlot;
import com.project.happy.dto.freeslot.FreeSlotResponse;
import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.loader.ast.spi.Loadable;

public interface IStudentSchedulingService {

    // ---------------- Appointment Operations ----------------

    boolean bookAppointment(Long studentId, Long tutorId, LocalDateTime date, LocalDateTime startTime, LocalDateTime endTime, String topic);

    List<Appointment> findApprovedAppointments(Long studentId);

    List<Appointment> viewAppointmentHistory(Long studentId);

    boolean cancelMeeting(Long meetingId, String reason);

    // ---------------- Helper / Optional ----------------

    List<Appointment> findCancellableAppointmentByStudent(Long studentId);

    List<FreeSlotResponse> viewTutorAvailableSlots(Long tutorId);

    //boolean checkTutorSlotAvailability(int tutorId, LocalDateTime date, LocalDateTime start, LocalDateTime end);

    Meeting viewMeetingDetails(Long meetingId);

}
