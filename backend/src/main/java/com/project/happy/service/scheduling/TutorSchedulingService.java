package com.project.happy.service.scheduling;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.happy.entity.Appointment;
import com.project.happy.entity.AppointmentStatus;
import com.project.happy.entity.Meeting;
import com.project.happy.repository.FreeSlotRepository;
import com.project.happy.repository.IMeetingRepository;

@Service
public class TutorSchedulingService implements ITutorSchedulingService {
    @Autowired
    private final IMeetingRepository meetingRepo;
    private final FreeSlotRepository slotRepo;

    public TutorSchedulingService(IMeetingRepository meetingRepo, FreeSlotRepository slotRepo) {
        this.meetingRepo = meetingRepo;
        this.slotRepo = slotRepo;
    }

    @Override
    public List<Appointment> viewPendingAppointments(Long tutorId) {
        return meetingRepo.findPendingAppointmentsByTutor(tutorId);
    }

    @Override
    public List<Appointment> viewOfficialAppointments(Long tutorId) {
        
        return meetingRepo.findOfficialAppointmentsByTutor(tutorId);
    }

    @Override
    public boolean approveAppointment(Long appointmentId, Long tutorId) {
        Meeting meeting = meetingRepo.findById(appointmentId);
        if (meeting instanceof Appointment) {
            Appointment appointment = (Appointment) meeting;
            if (appointment.getTutorId() != tutorId
                    || appointment.getAppointmentStatus() != AppointmentStatus.PENDING) {
                return false;
            }
            // boolean conflict = meetingRepo.overlapsWith(
            // appointment.getStartTime(),
            // appointment.getEndTime()
            // );
            appointment.approve();
            String onlineLink = createOnlineLink(appointment);
            appointment.setOnlineLink(onlineLink);
            meetingRepo.update(appointment);
            return true;
        }
        return false;
    }

    @Override
    public boolean rejectAppointment(Long appointmentId, Long tutorId, String reason) {
        Meeting meeting = meetingRepo.findById(appointmentId);
        if (meeting instanceof Appointment) {
            Appointment appointment = (Appointment) meeting;
            if (appointment.getTutorId() != tutorId
                    || appointment.getAppointmentStatus() != AppointmentStatus.PENDING) {
                return false;
            }
            appointment.reject(reason);
            meetingRepo.update(appointment);
            return true;
        }
        return false;
    }


    @Override
    public boolean cancelMeeting(Long tutorId, Long meetingId, String reason) {
        Meeting meeting = meetingRepo.findById(meetingId);
        if (meeting == null || meeting.isCancelled() || meeting.getTutorId() != tutorId) {
            return false;
        }
        boolean ok = meeting.cancel(reason);
        if (ok)
            meetingRepo.update(meeting);
        return ok;
    }

    @Override
    public List<Appointment> findPendingAppointments(Long tutorId) {
        return meetingRepo.findPendingAppointmentsByTutor(tutorId);
    }

    @Override
    public List<Meeting> viewOfficialMeetings(Long tutorId) {
        return meetingRepo.findOfficialMeetingsByTutor(tutorId);
    }
    

    /*
     * @Override
     * public boolean validateScheduleConflict(int tutorId, LocalDateTime start,
     * LocalDateTime end) {
     * List<Appointment> meetings =
     * meetingRepo.findPendingAppointmentsByTutor(tutorId);
     * for (Appointment a : meetings) {
     * if (a.overlapsWith(start, end)) {
     * return false;
     * }
     * }
     * return true;
     * }
     */
    @Override
    public Meeting viewMeetingDetails(Long meetingId) {
        return meetingRepo.findById(meetingId);
    }

    @Override
    public String createOnlineLink(Appointment appointment) {
        // Ví dụ tạo link online đơn giản
        return "https://meet.example.com/" + appointment.getMeetingId();
    }
}
