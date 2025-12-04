package com.project.happy.service.scheduling;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.happy.dto.freeslot.FreeSlotResponse;
import com.project.happy.entity.Appointment;
import com.project.happy.entity.Meeting;
import com.project.happy.entity.MeetingStatus;
import com.project.happy.entity.TutorAvailability;
import com.project.happy.repository.IAppointmentRepository;
import com.project.happy.service.freeslot.IFreeSlotService;

@Service
public class StudentSchedulingService implements IStudentSchedulingService {

    @Autowired
    private IAppointmentRepository appointmentRepo; // 💡 Inject IAppointmentRepository

    @Autowired
    private IFreeSlotService freeSlotService;

    public StudentSchedulingService(IAppointmentRepository appointmentRepo, IFreeSlotService freeSlotService) {
        this.appointmentRepo = appointmentRepo;
        this.freeSlotService = freeSlotService;
    }

    @Override
    @Transactional
    public boolean bookAppointment(Long studentId, Long tutorId, LocalDateTime date,
            LocalDateTime startTime, LocalDateTime endTime, String topic) {
        List<TutorAvailability> availableSlots = freeSlotService.getRawAvailableSlots(tutorId, startTime.toLocalDate());
        boolean canBook = availableSlots.stream()
                .anyMatch(s -> !startTime.toLocalTime().isBefore(s.getStartTime())
                        && !endTime.toLocalTime().isAfter(s.getEndTime()));

        if (!canBook) {
            throw new IllegalArgumentException(
                    "Rất tiếc, khung giờ này đã có người đặt trước. Vui lòng làm mới trang và chọn một khung giờ khác.");
        }
        Appointment appointment = new Appointment(
                tutorId,
                studentId,
                startTime,
                endTime,
                topic);
        
        // Set the availability ID
        appointment.setAvailabilityId(Math.toIntExact(matchingSlot.getAvailabilityId()));

        appointmentRepo.save(appointment);
        // 1. Cắt slot & Kiểm tra (Logic giữ nguyên)
        try {
            freeSlotService.reserveSlot(tutorId, startTime.toLocalDate(), startTime.toLocalTime(),
                    endTime.toLocalTime());
        } catch (Exception e) {
            throw new IllegalArgumentException(
                    "Khung giờ này không khả dụng hoặc đã có người đặt: " + e.getMessage());
        }
        System.out.println("--bbbbb-----");

        // 2. Tạo cuộc hẹn
        // Constructor này phải khớp với Appointment.java (không có ID)

        // Khi save, JPA sẽ tự động sinh ID
        // 💡 Dùng appointmentRepo

        // 2. Tạo cuộc hẹn
        // Constructor này phải khớp với Appointment.java (không có ID)

        // Khi save, JPA sẽ tự động sinh ID
        // 💡 Dùng appointmentRepo

        return true;
    }

    @Override
    @Transactional
    public boolean cancelMeeting(Long meetingId, String reason) {
        // Sửa: Xử lý Optional đúng cách và dùng appointmentRepo
        Appointment appointment = appointmentRepo.findById(meetingId).orElse(null);

        if (appointment == null || appointment.isCancelled()) {
            return false;
        }

        boolean ok = appointment.cancel(reason);

        if (ok) {
            appointmentRepo.save(appointment); // Sửa: Dùng save() để update

            // Trả lại slot
            try {
                freeSlotService.releaseSlot(
                        appointment.getTutorId(),
                        appointment.getStartTime().toLocalDate(),
                        appointment.getStartTime().toLocalTime(),
                        appointment.getEndTime().toLocalTime());
            } catch (Exception e) {
                System.err.println("Lỗi khi trả lịch rảnh: " + e.getMessage());
            }
        }
        return ok;
    }

    // --- VIEW / GETTERS ---

    @Override
    public List<FreeSlotResponse> viewTutorAvailableSlots(Long tutorId) {
        // Logic lấy Free Slot không liên quan đến Appointment Repo -> Giữ nguyên
        LocalDate today = LocalDate.now();
        int currentMonth = today.getMonthValue();
        int currentYear = today.getYear();
        List<FreeSlotResponse> thisMonth = freeSlotService.getMonthlySchedule(tutorId, currentMonth, currentYear);

        int nextMonth = (currentMonth == 12) ? 1 : currentMonth + 1;
        int nextYear = (currentMonth == 12) ? currentYear + 1 : currentYear;
        List<FreeSlotResponse> nextMonthSlots = freeSlotService.getMonthlySchedule(tutorId, nextMonth, nextYear);

        List<FreeSlotResponse> all = new ArrayList<>();
        all.addAll(thisMonth);
        all.addAll(nextMonthSlots);
        all.sort(Comparator.comparing(FreeSlotResponse::getDate));
        return all;
    }

    @Override
    public List<Appointment> viewAppointmentHistory(Long studentId) {
        // 💡 SỬA: Gọi đúng hàm trong IAppointmentRepository
        List<Appointment> list = appointmentRepo.findAllAppointmentsByStudent(studentId);
        list.forEach(m -> m.updateStatus(LocalDateTime.now()));
        return list;
    }

    @Override
    public Meeting viewMeetingDetails(Long meetingId) {
        // Trả về Appointment nhưng coi như Meeting
        Appointment appointment = appointmentRepo.findById(meetingId).orElse(null);
        if (appointment != null)
            appointment.updateStatus(LocalDateTime.now());
        return appointment;
    }

    @Override
    public List<Meeting> viewOfficialMeetings(Long studentId) {
        // 💡 SỬA: Gọi đúng hàm trong IAppointmentRepository và cast về Meeting
        List<Appointment> list = appointmentRepo.findOfficialAppointmentsByStudent(studentId);
        list.forEach(m -> m.updateStatus(LocalDateTime.now()));
        return new ArrayList<>(list);
    }

    @Override
    public List<Meeting> findCancellableMeetings(Long studentId) {
        // 💡 SỬA: Gọi đúng hàm trong IAppointmentRepository
        List<Appointment> officialMeetings = appointmentRepo.findOfficialAppointmentsByStudent(studentId);
        LocalDateTime now = LocalDateTime.now();

        return officialMeetings.stream()
                .peek(m -> m.updateStatus(now))
                .filter(m -> !m.isCancelled()
                        && (m.getStatus() == MeetingStatus.SCHEDULED || m.getStatus() == MeetingStatus.ONGOING))
                .map(m -> (Meeting) m) // Cast về Meeting
                .toList();
    }
}