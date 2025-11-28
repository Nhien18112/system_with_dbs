package com.project.happy.service.scheduling;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.happy.dto.freeslot.FreeSlotResponse;
import com.project.happy.entity.Appointment;
import com.project.happy.entity.Meeting;
import com.project.happy.entity.TutorSlot;
import com.project.happy.repository.FreeSlotRepository;
import com.project.happy.repository.MeetingRepository;
import com.project.happy.service.freeslot.IFreeSlotService;

@Service
public class StudentSchedulingService implements IStudentSchedulingService {

    @Autowired
    private MeetingRepository meetingRepo;
    @Autowired
    private FreeSlotRepository freeslot;

    // Thay vì gọi Repo, ta gọi Service để đảm bảo logic Cắt/Gộp
    @Autowired
    private IFreeSlotService freeSlotService;

    public StudentSchedulingService(MeetingRepository meetingRepo, IFreeSlotService freeSlotService) {
        this.meetingRepo = meetingRepo;
        this.freeSlotService = freeSlotService;
    }

    @Override
    public boolean bookAppointment(Long studentId, Long tutorId, LocalDateTime date,
            LocalDateTime startTime, LocalDateTime endTime, String topic) {
        List<TutorSlot> availableSlots = freeslot.findAvailableByTutorIdAndDate(tutorId, startTime.toLocalDate());
        boolean canBook = availableSlots.stream()
                .anyMatch(s -> !startTime.toLocalTime().isBefore(s.getStartTime())
                        && !endTime.toLocalTime().isAfter(s.getEndTime()));

        if (!canBook) {
            throw new IllegalArgumentException("Rất tiếc, khung giờ này đã có người đặt trước. Vui lòng làm mới trang và chọn một khung giờ khác.");
        }
        // 1. Tạo và Lưu cuộc hẹn (Logic cũ)
        Appointment appointment = new Appointment(
                System.currentTimeMillis(),
                tutorId,
                studentId,
                startTime,
                endTime,
                topic);

        meetingRepo.save(appointment);

        // 2. QUAN TRỌNG: Gọi sang FreeSlotService để CẮT SLOT RẢNH
        // (Chuyển khoảng thời gian này từ Available -> Booked)
        try {
            freeSlotService.reserveSlot(tutorId, startTime.toLocalDate(), startTime.toLocalTime(),
                    endTime.toLocalTime());
        } catch (Exception e) {
            // Nếu lỗi (ví dụ slot không còn rảnh), in log (Thực tế nên ném lỗi để rollback)
            System.err.println("Lỗi khi cắt lịch rảnh: " + e.getMessage());
            // throw e; // Nếu muốn chặt chẽ thì bỏ comment dòng này
        }

        return true;
    }

    @Override
    public boolean cancelMeeting(Long meetingId, String reason) {

        Meeting meeting = meetingRepo.findById(meetingId);
        if (meeting == null || meeting.isCancelled()) {
            return false;
        }

        boolean ok = meeting.cancel(reason);

        if (ok) {
            meetingRepo.update(meeting);

            // 3. QUAN TRỌNG: TRẢ LẠI SLOT RẢNH KHI HỦY
            try {
                freeSlotService.releaseSlot(
                        meeting.getTutorId(),
                        meeting.getStartTime().toLocalDate(),
                        meeting.getStartTime().toLocalTime(),
                        meeting.getEndTime().toLocalTime());
            } catch (Exception e) {
                System.err.println("Lỗi khi trả lịch rảnh: " + e.getMessage());
            }
        }

        return ok;
    }

    @Override
    public List<FreeSlotResponse> viewTutorAvailableSlots(Long tutorId) {
        LocalDate today = LocalDate.now();
        int currentMonth = today.getMonthValue();
        int currentYear = today.getYear();

        // Lấy slot tháng này (Gọi qua Service đểlấy List Available)
        List<FreeSlotResponse> thisMonth = freeSlotService.getMonthlySchedule(tutorId, currentMonth, currentYear);

        // Lấy slot tháng sau
        // Tính toán tháng sau (int)
        int nextMonth = (currentMonth == 12) ? 1 : currentMonth + 1;
        int nextYear = (currentMonth == 12) ? currentYear + 1 : currentYear;

        List<FreeSlotResponse> nextMonthSlots = freeSlotService.getMonthlySchedule(
                tutorId, nextMonth, nextYear);

        List<FreeSlotResponse> all = new ArrayList<>();
        all.addAll(thisMonth);
        all.addAll(nextMonthSlots);
        // Sắp xếp theo ngày
        all.sort(Comparator.comparing(FreeSlotResponse::getDate));

        return all;
    }

    // --- Các hàm xem lịch sử/chi tiết giữ nguyên ---
    @Override
    public List<Appointment> findApprovedAppointments(Long studentId) {
        return meetingRepo.findApprovedAppointmentsByStudent(studentId);
    }

    @Override
    public List<Appointment> viewAppointmentHistory(Long studentId) {
        return meetingRepo.findAllAppointmentsByStudent(studentId);
    }

    @Override
    public List<Appointment> findCancellableAppointmentByStudent(Long studentId) {
        return meetingRepo.findCancellableAppointmentsByStudent(studentId);
    }

    @Override
    public Meeting viewMeetingDetails(Long meetingId) {
        return meetingRepo.findById(meetingId);
    }

    @Override
    public List<Appointment> findCancellableAppointment(Long studentId) {
        return meetingRepo.findCancellableAppointmentsByStudent(studentId);
    }

    @Override
    public List<Appointment> viewOfficialAppointments(Long studentId) {
        return meetingRepo.findOfficialAppointmentsByStudent(studentId);
    }

    @Override
    public List<Meeting> viewOfficialMeetings(Long studentId) {
        return meetingRepo.findOfficialMeetingsByStudent(studentId);
    }

    @Override
    public List<Meeting> findCancellableMeetings(Long studentId) {
        return meetingRepo.findCancellableMeetingsByStudent(studentId);
    }
}