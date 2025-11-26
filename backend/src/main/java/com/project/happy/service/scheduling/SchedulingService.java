package com.project.happy.service.scheduling;

import java.util.List;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;

import com.project.happy.dto.scheduling.AppointmentRequest;
import com.project.happy.dto.scheduling.ApproveRequest;
import com.project.happy.dto.scheduling.CancelRequest;
import com.project.happy.entity.Meeting;
import com.project.happy.repository.IMeetingRepository;


@Service
public class SchedulingService {

    private final IMeetingRepository studentRepo;


    public SchedulingService(
            IMeetingRepository studentRepo,
            ITutorSchedulingRepository tutorRepo) {
        this.studentRepo = studentRepo;
        this.tutorRepo = tutorRepo;
    }

    public boolean bookAppointment(AppointmentRequest request) {

        return studentRepo.bookAppointment(
                request.getStudentId(),
                request.getTutorId(),
                request.getDate(),
                request.getStartTime(),
                request.getTopic());
    }

    public boolean approveAppointment(Long apptId, ApproveRequest req) {

        return tutorRepo.approveAppointment(
                apptId,
                req.getTutorId());
    }

    public boolean rejectAppointment(Long apptId, ApproveRequest req) {

        return tutorRepo.rejectAppointment(
                apptId,
                req.getTutorId());
    }

    public boolean cancelAppointment(Long meetingId, CancelRequest req) {


    boolean studentResult = studentRepo.cancelMeeting(
            meetingId,
            req.getUserId(),
            req.getReason()
    );

    if (studentResult) return true;

    
    return tutorRepo.cancelMeeting(
            meetingId,
            req.getUserId(),
            req.getReason()
    );
}


    public List<Meeting> getMeetings(Long userId) {

        List<Meeting> studentMeetings = studentRepo.viewMeetings(userId);
        List<Meeting> tutorMeetings = tutorRepo.viewMeetings(userId);

        return Stream.concat(studentMeetings.stream(), tutorMeetings.stream())
                .distinct()
                .toList();
    }
}
