package com.project.happy.service.scheduling;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.happy.entity.Appointment;
import com.project.happy.entity.AppointmentStatus;
import com.project.happy.entity.Meeting;
import com.project.happy.entity.MeetingStatus;
import com.project.happy.repository.IMeetingRepository;
import com.project.happy.service.freeslot.IFreeSlotService;

@Service
public class TutorSchedulingService implements ITutorSchedulingService {
    @Autowired
    private final IMeetingRepository meetingRepo;
    @Autowired
    private IFreeSlotService freeSlotService;

    public TutorSchedulingService(IMeetingRepository meetingRepo, IFreeSlotService slotService) {
        this.meetingRepo = meetingRepo;
        this.freeSlotService = slotService;
    }

    @Override
    public List<Appointment> viewPendingAppointments(Long tutorId) {
        LocalDateTime now = LocalDateTime.now();

        // Lấy tất cả appointment PENDING từ repo (không tự động reject trong repo)
        List<Appointment> pending = meetingRepo.findPendingAppointmentsByTutor(tutorId);

        // Duyệt danh sách, nếu appointment đã qua thời gian hiện tại thì reject
        pending.forEach(a -> {
            if (a.getStartTime().isBefore(now)) {
                a.reject("Thời gian đã qua");
                meetingRepo.update(a); // cập nhật trạng thái trong DB
            }
        });

        // Trả về chỉ những appointment vẫn còn PENDING
        return pending.stream()
                .filter(a -> a.getAppointmentStatus() == AppointmentStatus.PENDING)
                .toList();
    }

    @Override
    public List<Meeting> findCancellableMeetings(Long tutorId) {
        List<Meeting> officialMeetings = meetingRepo.findOfficialMeetingsByTutor(tutorId);
        LocalDateTime now = LocalDateTime.now();

        return officialMeetings.stream()
                .peek(m -> m.updateStatus(now)) // cập nhật status real-time
                .filter(m -> !m.isCancelled()
                        && (m.getStatus() == MeetingStatus.SCHEDULED || m.getStatus() == MeetingStatus.ONGOING))
                .toList();
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
    public boolean tutorReturnCancelledSlot(Long tutorId, Long meetingId) {
        Meeting meeting = meetingRepo.findById(meetingId);
        if (meeting == null || meeting.isCancelled() || meeting.getTutorId() != tutorId) {
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
        List<Meeting> list = meetingRepo.findOfficialMeetingsByStudent(tutorId);
        list.forEach(m -> m.updateStatus(LocalDateTime.now()));
        return list;

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
        Meeting meeting = meetingRepo.findById(meetingId);
        if (meeting != null) {
            meeting.updateStatus(LocalDateTime.now());
        }
        return meeting;
    }

    @Override
    public String createOnlineLink(Appointment appointment) {
        // Ví dụ tạo link online đơn giản
        return "https://meet.example.com/" + appointment.getMeetingId();
    }
}
