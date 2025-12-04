package com.project.happy.service.freeslot.strategy;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import com.project.happy.dto.freeslot.FreeSlotRequest;
import com.project.happy.entity.Appointment;
import com.project.happy.entity.MeetingStatus;
import com.project.happy.entity.TutorAvailability;
import com.project.happy.repository.IFreeSlotRepository;
import com.project.happy.repository.IAppointmentRepository; // 💡 SỬA: Import Repo mới

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Component("overwrite")
public class OverwriteStrategy implements SlotOperationStrategy {

    @Autowired private IFreeSlotRepository repo;
    
    // 💡 SỬA: Inject IAppointmentRepository thay vì IMeetingRepository
    @Autowired private IAppointmentRepository appointmentRepo; 

    private static final TutorAvailability.Status AVAILABLE_STATUS = TutorAvailability.Status.AVAILABLE;
    private static final TutorAvailability.Status UNAVAILABLE_STATUS = TutorAvailability.Status.UNAVAILABLE; 

    @Override
    @Transactional
    public void execute(Long tutorId, FreeSlotRequest request) {
        LocalDate targetDate = request.getDate();
        List<FreeSlotRequest.TimeRange> rawRanges = request.getTimeRanges();

        // 1. Gộp range input
        List<FreeSlotRequest.TimeRange> mergedInput = mergeInputRanges(rawRanges);

        // 2. Lấy lịch hẹn (Sử dụng hàm helper đã cập nhật)
        List<Appointment> existingAppointments = getActiveAppointments(tutorId, targetDate);

        // 3. Tính toán Rảnh/Bận
        List<TutorAvailability> newAvailable = new ArrayList<>();
        List<TutorAvailability> newUnavailable = new ArrayList<>();

        if (mergedInput != null) {
            for (FreeSlotRequest.TimeRange range : mergedInput) {
                splitRangeByAppointments(tutorId, targetDate, range, existingAppointments, newAvailable, newUnavailable);
            }
        }

        // 4. LƯU
        repo.deleteByTutorIdAndAvailableDate(tutorId, targetDate); 
        
        if (!newAvailable.isEmpty()) repo.saveAll(newAvailable);
        if (!newUnavailable.isEmpty()) repo.saveAll(newUnavailable);
    }

    // --- CÁC HÀM PRIVATE HELPER ---

    private List<Appointment> getActiveAppointments(Long tutorId, LocalDate date) {
        // 💡 SỬA: Sử dụng appointmentRepo để lấy dữ liệu
        List<Appointment> all = new ArrayList<>();
        
        // Gọi hàm findPending... từ AppointmentRepository
        all.addAll(appointmentRepo.findPendingAppointmentsByTutor(tutorId));
        
        // Gọi hàm findOfficial... từ AppointmentRepository (Thay thế findApproved...)
        all.addAll(appointmentRepo.findOfficialAppointmentsByTutor(tutorId));
        
        return all.stream()
            .filter(a -> a.getStartTime().toLocalDate().equals(date))
            // .filter(a -> a.getStatus() != MeetingStatus.CANCELLED) // findOfficial đã lọc cancelled rồi, nhưng giữ lại cũng không sao
            .sorted(Comparator.comparing(Appointment::getStartTime))
            .collect(Collectors.toList());
    }

    // ... (Các hàm helper khác: splitRangeByAppointments, mergeInputRanges giữ nguyên logic) ...
    
    private void splitRangeByAppointments(Long tutorId, LocalDate date, FreeSlotRequest.TimeRange range, 
            List<Appointment> appointments, 
            List<TutorAvailability> availableList, 
            List<TutorAvailability> bookedList) {
        // ... (Logic giữ nguyên như phiên bản trước)
        // Copy lại logic splitRangeByAppointments từ câu trả lời trước đó của tôi
        // Đảm bảo dùng TutorAvailability
        List<Appointment> overlaps = appointments.stream()
            .filter(a -> a.getStartTime().toLocalTime().isBefore(range.getEndTime()) && a.getEndTime().toLocalTime().isAfter(range.getStartTime()))
            .sorted(Comparator.comparing(Appointment::getStartTime))
            .collect(Collectors.toList());

        if (overlaps.isEmpty()) {
            TutorAvailability newSlot = new TutorAvailability();
            newSlot.setTutorId(tutorId);
            newSlot.setAvailableDate(date);
            newSlot.setStartTime(range.getStartTime());
            newSlot.setEndTime(range.getEndTime());
            newSlot.setStatus(AVAILABLE_STATUS); 
            availableList.add(newSlot);
        } else {
            LocalTime currentStart = range.getStartTime();
            for (Appointment appt : overlaps) {
                LocalTime apptStart = appt.getStartTime().toLocalTime();
                LocalTime apptEnd = appt.getEndTime().toLocalTime();
                LocalTime effectiveStart = apptStart.isBefore(range.getStartTime()) ? range.getStartTime() : apptStart;
                LocalTime effectiveEnd = apptEnd.isAfter(range.getEndTime()) ? range.getEndTime() : apptEnd;

                if (currentStart.isBefore(effectiveStart)) {
                    TutorAvailability availableSlot = new TutorAvailability();
                    availableSlot.setTutorId(tutorId);
                    availableSlot.setAvailableDate(date);
                    availableSlot.setStartTime(currentStart);
                    availableSlot.setEndTime(effectiveStart);
                    availableSlot.setStatus(AVAILABLE_STATUS);
                    availableList.add(availableSlot);
                }
                if (effectiveStart.isBefore(effectiveEnd)) {
                    TutorAvailability bookedSlot = new TutorAvailability();
                    bookedSlot.setTutorId(tutorId);
                    bookedSlot.setAvailableDate(date);
                    bookedSlot.setStartTime(effectiveStart);
                    bookedSlot.setEndTime(effectiveEnd);
                    bookedSlot.setStatus(UNAVAILABLE_STATUS);
                    bookedList.add(bookedSlot);
                }
                if (effectiveEnd.isAfter(currentStart)) currentStart = effectiveEnd;
            }
            if (currentStart.isBefore(range.getEndTime())) {
                TutorAvailability lastSlot = new TutorAvailability();
                lastSlot.setTutorId(tutorId);
                lastSlot.setAvailableDate(date);
                lastSlot.setStartTime(currentStart);
                lastSlot.setEndTime(range.getEndTime());
                lastSlot.setStatus(AVAILABLE_STATUS);
                availableList.add(lastSlot);
            }
        }
    }

    private List<FreeSlotRequest.TimeRange> mergeInputRanges(List<FreeSlotRequest.TimeRange> ranges) {
        if (ranges == null || ranges.isEmpty()) return new ArrayList<>();
        ranges.sort(Comparator.comparing(FreeSlotRequest.TimeRange::getStartTime));
        List<FreeSlotRequest.TimeRange> result = new ArrayList<>();
        FreeSlotRequest.TimeRange current = ranges.get(0);

        for (int i = 1; i < ranges.size(); i++) {
            FreeSlotRequest.TimeRange next = ranges.get(i);
            if (!current.getEndTime().isBefore(next.getStartTime())) {
                LocalTime maxEnd = current.getEndTime().isAfter(next.getEndTime()) ? current.getEndTime() : next.getEndTime();
                current.setEndTime(maxEnd);
            } else {
                result.add(current);
                current = next;
            }
        }
        result.add(current);
        return result;
    }
}