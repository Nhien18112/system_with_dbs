package com.project.happy.service.scheduling;

import com.project.happy.entity.Appointment;
import com.project.happy.entity.Meeting;
import com.project.happy.service.scheduling.IStudentSchedulingService;
import com.project.happy.repository.MeetingRepository;

import org.springframework.beans.factory.annotation.Autowired;
//import com.project.happy.util.AvailableSlot;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentSchedulingService implements IStudentSchedulingService {

    @Autowired
    private  MeetingRepository meetingRepo;
    //private final AvailableSlotService slotService;

    public StudentSchedulingService(MeetingRepository meetingRepo/*, AvailableSlotService slotService*/) {
        this.meetingRepo = meetingRepo;
        //this.slotService = slotService;
    }
        

   
    /* 
     @Override
    public boolean bookAppointment(int studentId, int tutorId, LocalDateTime date, LocalDateTime startTime, String topic) {
        // Kiểm tra slot tutor có trống không
        if (!slotService.checkTutorSlotAvailability(tutorId, date, startTime, startTime.plusHours(1))) {
            return false;
        }

        // Tạo Appointment mới
        Appointment appointment = new Appointment();
        appointment.setStudentId(studentId);
        appointment.setTutorId(tutorId);
        appointment.setDate(date.toLocalDate());
        appointment.setStartTime(date.toLocalTime());
        appointment.setEndTime(startTime.plusHours(1).toLocalTime()); // Giả sử 1 giờ
        appointment.setTopic(topic);
        appointment.setAppointmentStatus(Appointment.AppointmentStatus.PENDING);

        // Lưu vào repo
        meetingRepo.save(appointment);
        return true;
    }

    @Override
    public List<Appointment> findApprovedAppointments(int studentId) {
        return meetingRepo.findApprovedAppointmentsByStudent(studentId);
    }

    @Override
    public List<Appointment> viewAppointmentHistory(int studentId) {
        return meetingRepo.findAllAppointmentsByStudent(studentId);
    }

    @Override
    public boolean cancelMeeting(int studentId, int meetingId, String reason) {
        Meeting meeting = meetingRepo.findById(meetingId);
        if (meeting == null || meeting.isCancelled() || meeting.getTutorId() == null) {
            return false;
        }

        meeting.cancel(studentId, reason);
        meetingRepo.update(meeting);
        return true;
    }
        */
    @Override
    public List<Meeting> findCancellableMeetings(int studentId) {
        return meetingRepo.findCancellableMeetings(studentId);
    }
    /* 
    @Override
    public List<AvailableSlot> viewTutorAvailableSlots(int tutorId) {
        return slotService.getAvailableSlots(tutorId);
    }

    @Override
    public boolean checkTutorSlotAvailability(int tutorId, LocalDateTime date, LocalDateTime start, LocalDateTime end) {
        return slotService.checkTutorSlotAvailability(tutorId, date, start, end);
    }
*/
    @Override
    public Meeting viewMeetingDetails(int meetingId) {
        return meetingRepo.findById(meetingId);
    }
}