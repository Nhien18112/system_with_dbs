package com.project.happy.service.scheduling;

import com.project.happy.entity.Appointment;
import com.project.happy.entity.AppointmentStatus;
import com.project.happy.entity.Meeting;
import com.project.happy.repository.IMeetingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TutorSchedulingService implements ITutorSchedulingService {

    private final IMeetingRepository meetingRepo;

    @Autowired
    public TutorSchedulingService(IMeetingRepository meetingRepo) {
        this.meetingRepo = meetingRepo;
    }

    @Override
    public List<Appointment> viewPendingAppointments(Long tutorId) {
        return meetingRepo.findPendingAppointmentsByTutor(tutorId);
    }

    @Override
    public String approveAppointment(Long appointmentId, Long tutorId) {
        Meeting meeting = meetingRepo.findById(appointmentId);
        if (meeting instanceof Appointment) {
            Appointment appointment = (Appointment) meeting;
            if (appointment.getTutorId() != tutorId
                    || appointment.getAppointmentStatus() != AppointmentStatus.PENDING) {
                return null;
            }
        //     boolean conflict = meetingRepo.overlapsWith(
        //         appointment.getStartTime(),
        //         appointment.getEndTime()
        // );
            appointment.approve();
            String onlineLink = createOnlineLink(appointment);
            appointment.setOnlineLink(onlineLink);
            meetingRepo.update(appointment);
            return onlineLink;
        }
        return null;
    }

    @Override
    public boolean rejectAppointment(Long appointmentId, Long tutorId) {
        Meeting meeting = meetingRepo.findById(appointmentId);
        if (meeting instanceof Appointment) {
            Appointment appointment = (Appointment) meeting;
            if (appointment.getTutorId() != tutorId
                    || appointment.getAppointmentStatus() != AppointmentStatus.PENDING) {
                return false;
            }
            appointment.reject();
            meetingRepo.update(appointment);
            return true;
        }
        return false;
    }

    @Override
    public List<Appointment> viewApprovedAppointments(Long tutorId) {
        return meetingRepo.findApprovedAppointmentsByTutor(tutorId);
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
    public List<Appointment> findPendingAppointmentsByTutor(Long tutorId) {
        return meetingRepo.findPendingAppointmentsByTutor(tutorId);
    }

    @Override
    public List<Appointment> findApprovedAppointmentsByTutor(Long tutorId) {
        return meetingRepo.findApprovedAppointmentsByTutor(tutorId);
    }

    /*@Override
    public boolean validateScheduleConflict(int tutorId, LocalDateTime start, LocalDateTime end) {
        List<Appointment> meetings = meetingRepo.findPendingAppointmentsByTutor(tutorId);
        for (Appointment a : meetings) {
            if (a.overlapsWith(start, end)) {
                return false;
            }
        }
        return true;
    }
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
