package com.project.happy.service.scheduling;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.happy.entity.Appointment;
import com.project.happy.entity.AppointmentStatus;
import com.project.happy.entity.Meeting;
import com.project.happy.entity.MeetingStatus;
import com.project.happy.repository.IAppointmentRepository; // 💡 Dùng Repo mới
import com.project.happy.service.freeslot.IFreeSlotService;

@Service
public class TutorSchedulingService implements ITutorSchedulingService {

    @Autowired
    private IAppointmentRepository appointmentRepo; // 💡 Inject Repo mới
    
    @Autowired
    private IFreeSlotService freeSlotService;

    public TutorSchedulingService(IAppointmentRepository appointmentRepo, IFreeSlotService slotService) {
        this.appointmentRepo = appointmentRepo;
        this.freeSlotService = slotService;
    }

    @Override
    @Transactional
    public List<Appointment> viewPendingAppointments(Long tutorId) {
        LocalDateTime now = LocalDateTime.now();

        // 1. Lấy dữ liệu từ DB
        List<Appointment> pending = appointmentRepo.findPendingAppointmentsByTutor(tutorId);

        // 2. Logic tự động Reject nếu quá hạn
        pending.forEach(a -> {
            if (a.getStartTime().isBefore(now)) {
                a.reject("Thời gian đã qua (Hệ thống tự động từ chối)");
                appointmentRepo.save(a); 
            }
        });

        // 3. Trả về danh sách
        return pending.stream()
                .filter(a -> a.getAppointmentStatus() == AppointmentStatus.PENDING)
                .toList();
    }

    @Override
    public List<Meeting> findCancellableMeetings(Long tutorId) {
        // Lấy danh sách từ DB
        List<Appointment> officialMeetings = appointmentRepo.findOfficialAppointmentsByTutor(tutorId);
        LocalDateTime now = LocalDateTime.now();

        // Logic cập nhật trạng thái hiển thị
        return officialMeetings.stream()
                .peek(m -> m.updateStatus(now))
                .filter(m -> !m.isCancelled()
                        && (m.getStatus() == MeetingStatus.SCHEDULED || m.getStatus() == MeetingStatus.ONGOING))
                .map(m -> (Meeting) m) // Cast về Meeting để trả về
                .toList();
    }

    @Override
    @Transactional
    public boolean approveAppointment(Long appointmentId, Long tutorId) {
        Appointment appointment = appointmentRepo.findById(appointmentId).orElse(null);

        if (appointment != null) {
            // Validate quyền sở hữu và trạng thái
            if (!appointment.getTutorId().equals(tutorId) 
                    || appointment.getAppointmentStatus() != AppointmentStatus.PENDING) {
                return false;
            }

            // Logic Approve
            appointment.approve();
            String onlineLink = createOnlineLink(appointment);
            appointment.setOnlineLink(onlineLink);
            
            appointmentRepo.save(appointment); 
            return true;
        }
        return false;
    }

    @Override
    @Transactional
    public boolean rejectAppointment(Long appointmentId, Long tutorId, String reason) {
        Appointment appointment = appointmentRepo.findById(appointmentId).orElse(null);

        if (appointment != null) {
            if (!appointment.getTutorId().equals(tutorId) 
                    || appointment.getAppointmentStatus() != AppointmentStatus.PENDING) {
                return false;
            }

            appointment.reject(reason);
            appointmentRepo.save(appointment); 
            
            // Trả lại slot rảnh
            tutorReturnCancelledSlot(tutorId, appointmentId);
            
            return true;
        }
        return false;
    }

    @Override
    @Transactional
    public boolean cancelMeeting(Long tutorId, Long meetingId, String reason) {
        Appointment meeting = appointmentRepo.findById(meetingId).orElse(null);

        if (meeting == null || meeting.isCancelled() || !meeting.getTutorId().equals(tutorId)) {
            return false;
        }

        boolean ok = meeting.cancel(reason);
        if (ok) {
            appointmentRepo.save(meeting);
            tutorReturnCancelledSlot(tutorId, meetingId);
        }
        return ok;
    }

    @Override
    @Transactional
    public boolean tutorReturnCancelledSlot(Long tutorId, Long meetingId) {
        Appointment meeting = appointmentRepo.findById(meetingId).orElse(null);
        
        if (meeting == null || !meeting.getTutorId().equals(tutorId)) {
            return false;
        }

        try {
            freeSlotService.releaseSlot(
                    meeting.getTutorId(),
                    meeting.getStartTime().toLocalDate(),
                    meeting.getStartTime().toLocalTime(),
                    meeting.getEndTime().toLocalTime());
            return true;

        } catch (Exception e) {
            System.err.println("Lỗi khi trả lại slot rảnh: " + e.getMessage());
            return false;
        }
    }

    @Override
    public List<Meeting> viewOfficialMeetings(Long tutorId) {
        List<Appointment> list = appointmentRepo.findOfficialAppointmentsByTutor(tutorId);
        
        list.forEach(m -> m.updateStatus(LocalDateTime.now()));
        return new ArrayList<>(list);
    }

    @Override
    public Meeting viewMeetingDetails(Long meetingId) {
        Appointment meeting = appointmentRepo.findById(meetingId).orElse(null);
        if (meeting != null) {
            meeting.updateStatus(LocalDateTime.now());
        }
        return meeting;
    }

    @Override
    public String createOnlineLink(Appointment appointment) {
        return "https://meet.example.com/" + appointment.getAppointmentId();
    }

    @Override
    public Appointment viewAppointmentDetails(Long appointmentId) {
        return appointmentRepo.findById(appointmentId).orElse(null);
    }
}