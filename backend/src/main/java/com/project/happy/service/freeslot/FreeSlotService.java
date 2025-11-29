package com.project.happy.service.freeslot;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.happy.dto.freeslot.FreeSlotRequest;
import com.project.happy.dto.freeslot.FreeSlotResponse;
import com.project.happy.entity.Appointment;
import com.project.happy.entity.MeetingStatus;
import com.project.happy.entity.TutorSlot;
import com.project.happy.repository.IFreeSlotRepository;
import com.project.happy.repository.IMeetingRepository;

@Service
public class FreeSlotService implements IFreeSlotService {

    @Autowired
    private IFreeSlotRepository repo;

    @Autowired
    private IMeetingRepository meetingRepo;

    // =========================================================================
    // 1. PUBLIC API - LẤY DỮ LIỆU
    // =========================================================================
    @Override
    public FreeSlotResponse getDailySchedule(Long tutorId, LocalDate date) {
        // Chỉ lấy list AVAILABLE để hiện lên FE
        List<TutorSlot> slots = repo.findAvailableByTutorIdAndDate(tutorId, date);
        return convertToResponse(tutorId, date, slots);
    }

    @Override
    public List<FreeSlotResponse> getMonthlySchedule(Long tutorId, int month, int year) {
        List<TutorSlot> slots = repo.findAvailableByTutorIdAndDateBetween(tutorId, month, year);
        return slots.stream()
                .collect(Collectors.groupingBy(TutorSlot::getDate))
                .entrySet().stream()
                .map(entry -> convertToResponse(tutorId, entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
    }

    // =========================================================================
    // 2. PUBLIC API - GHI ĐÈ LỊCH (TUTOR SETUP)
    // =========================================================================
    @Override
    @Transactional
    public List<String> overwriteDailySchedule(Long tutorId, FreeSlotRequest request) {
        LocalDate targetDate = request.getDate();
        List<FreeSlotRequest.TimeRange> rawRanges = request.getTimeRanges();
        List<String> warnings = new ArrayList<>();

        // Validate
        if (rawRanges != null) {
            for (FreeSlotRequest.TimeRange range : rawRanges) {
                if (!range.getStartTime().isBefore(range.getEndTime())) {
                    throw new IllegalArgumentException("Lỗi: Giờ bắt đầu phải nhỏ hơn kết thúc.");
                }
            }
        }

        // 1. Gộp các khoảng thời gian nhập vào (5-7 & 6-9 -> 5-9)
        List<FreeSlotRequest.TimeRange> mergedInput = mergeInputRanges(rawRanges);

        // 2. Lấy danh sách cuộc hẹn hiện tại
        List<Appointment> existingAppointments = getActiveAppointments(tutorId, targetDate);

        // 3. Kiểm tra Orphan (Hẹn nằm ngoài vùng phủ sóng)
        checkOrphanAppointments(existingAppointments, mergedInput, warnings);

        // 4. Tính toán danh sách Rảnh và Bận mới
        List<TutorSlot> newAvailable = new ArrayList<>();
        List<TutorSlot> newBooked = new ArrayList<>();

        if (mergedInput != null) {
            for (FreeSlotRequest.TimeRange range : mergedInput) {
                // Tách range dựa trên các cuộc hẹn chen ngang
                splitRangeByAppointments(tutorId, targetDate, range, existingAppointments, 
                                         newAvailable, newBooked, warnings);
            }
        }

        // 5. Lưu xuống DB (Dùng hàm chung)
        saveUpdates(tutorId, targetDate, newAvailable, newBooked);

        return warnings;
    }

    // =========================================================================
    // 3. PUBLIC API - ĐẶT LỊCH (RESERVE)
    // =========================================================================
    @Override
    @Transactional
    public void reserveSlot(Long tutorId, LocalDate date, LocalTime start, LocalTime end) {
        // Load dữ liệu hiện tại
        List<TutorSlot> availableSlots = repo.findAvailableByTutorIdAndDate(tutorId, date);
        List<TutorSlot> bookedSlots = repo.findBookedByTutorIdAndDate(tutorId, date);

        // Tìm slot rảnh CHỨA được giờ đặt
        TutorSlot targetSlot = availableSlots.stream()
                .filter(s -> !start.isBefore(s.getStartTime()) && !end.isAfter(s.getEndTime()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Khung giờ " + start + "-" + end + " không có sẵn!"));

        // Cắt slot rảnh ra
        availableSlots.remove(targetSlot);
        
        // 1. Phần rảnh đầu
        if (targetSlot.getStartTime().isBefore(start)) {
            availableSlots.add(createSlot(tutorId, date, targetSlot.getStartTime(), start));
        }
        // 2. Phần bận (Giờ đặt)
        bookedSlots.add(createSlot(tutorId, date, start, end));
        
        // 3. Phần rảnh đuôi
        if (end.isBefore(targetSlot.getEndTime())) {
            availableSlots.add(createSlot(tutorId, date, end, targetSlot.getEndTime()));
        }

        // Lưu lại
        saveUpdates(tutorId, date, availableSlots, bookedSlots);
        System.out.println(">>> RESERVED: " + start + "-" + end);
    }

    // =========================================================================
    // 4. PUBLIC API - TRẢ LỊCH (RELEASE)
    // =========================================================================
    @Override
    @Transactional
    public void releaseSlot(Long tutorId, LocalDate date, LocalTime start, LocalTime end) {
        List<TutorSlot> availableSlots = repo.findAvailableByTutorIdAndDate(tutorId, date);
        List<TutorSlot> bookedSlots = repo.findBookedByTutorIdAndDate(tutorId, date);

        List<TutorSlot> slotsToRelease = new ArrayList<>();

        // 1. Tìm các slot Bận có GIAO NHAU với khoảng giờ hủy
        // (Start Slot < End Cancel) && (End Slot > Start Cancel)
        for (TutorSlot slot : bookedSlots) {
            if (isOverlapping(slot.getStartTime(), slot.getEndTime(), start, end)) {
                slotsToRelease.add(slot);
            }
        }

        if (slotsToRelease.isEmpty()) return;

        // 2. Chuyển từ Bận sang Rảnh
        bookedSlots.removeAll(slotsToRelease);
        availableSlots.addAll(slotsToRelease);

        // 3. GỘP CÁC SLOT RẢNH (Logic quan trọng: 7-9 + 9-9:30 -> 7-9:30)
        List<TutorSlot> mergedAvailable = mergeTutorSlots(availableSlots);

        // Lưu lại
        saveUpdates(tutorId, date, mergedAvailable, bookedSlots);
        System.out.println(">>> RELEASED & MERGED: " + start + "-" + end);
    }

    // =========================================================================
    // 5. PRIVATE HELPER METHODS (HÀM DÙNG CHUNG)
    // =========================================================================

    // Hàm lưu DB tập trung (Tránh lặp code delete/save)
    private void saveUpdates(Long tutorId, LocalDate date, List<TutorSlot> available, List<TutorSlot> booked) {
        repo.deleteAllByTutorIdAndDate(tutorId, date); // Xóa cũ
        if (!available.isEmpty()) repo.saveAvailable(available);
        if (!booked.isEmpty()) repo.saveBooked(booked);
    }

    // Kiểm tra giao nhau: (Start A < End B) && (End A > Start B)
    private boolean isOverlapping(LocalTime s1, LocalTime e1, LocalTime s2, LocalTime e2) {
        return s1.isBefore(e2) && e1.isAfter(s2);
    }

    // Logic cắt range thành các slot nhỏ dựa trên danh sách cuộc hẹn
    private void splitRangeByAppointments(Long tutorId, LocalDate date, FreeSlotRequest.TimeRange range, 
                                          List<Appointment> appointments, 
                                          List<TutorSlot> availableList, 
                                          List<TutorSlot> bookedList,
                                          List<String> warnings) {
        // Lấy các cuộc hẹn có giao nhau với range này
        List<Appointment> overlaps = appointments.stream()
            .filter(a -> isOverlapping(a.getStartTime().toLocalTime(), a.getEndTime().toLocalTime(), range.getStartTime(), range.getEndTime()))
            .sorted(Comparator.comparing(Appointment::getStartTime))
            .collect(Collectors.toList());

        if (overlaps.isEmpty()) {
            availableList.add(createSlot(tutorId, date, range.getStartTime(), range.getEndTime()));
        } else {
            warnings.add("Khung giờ " + range.getStartTime() + "-" + range.getEndTime() + " đã tách ra do trùng " + overlaps.size() + " lịch hẹn.");
            LocalTime currentStart = range.getStartTime();

            for (Appointment appt : overlaps) {
                LocalTime apptStart = appt.getStartTime().toLocalTime();
                LocalTime apptEnd = appt.getEndTime().toLocalTime();

                // Cắt cho vừa khít với range (nếu cuộc hẹn lòi ra ngoài range)
                LocalTime effectiveStart = apptStart.isBefore(range.getStartTime()) ? range.getStartTime() : apptStart;
                LocalTime effectiveEnd = apptEnd.isAfter(range.getEndTime()) ? range.getEndTime() : apptEnd;

                // 1. Khoảng Rảnh trước cuộc hẹn
                if (currentStart.isBefore(effectiveStart)) {
                    availableList.add(createSlot(tutorId, date, currentStart, effectiveStart));
                }
                
                // 2. Khoảng Bận (Cuộc hẹn)
                if (effectiveStart.isBefore(effectiveEnd)) {
                    bookedList.add(createSlot(tutorId, date, effectiveStart, effectiveEnd)); // Có thể set status="BOOKED" nếu cần
                }

                // Cập nhật điểm tiếp theo
                if (effectiveEnd.isAfter(currentStart)) currentStart = effectiveEnd;
            }
            
            // 3. Khoảng Rảnh sau cùng
            if (currentStart.isBefore(range.getEndTime())) {
                availableList.add(createSlot(tutorId, date, currentStart, range.getEndTime()));
            }
        }
    }

    // Logic gộp các Entity TutorSlot liền kề (Dùng cho Release)
    private List<TutorSlot> mergeTutorSlots(List<TutorSlot> slots) {
        if (slots == null || slots.isEmpty()) return new ArrayList<>();
        slots.sort(Comparator.comparing(TutorSlot::getStartTime));

        List<TutorSlot> result = new ArrayList<>();
        TutorSlot current = slots.get(0);

        for (int i = 1; i < slots.size(); i++) {
            TutorSlot next = slots.get(i);
            // Gộp nếu chồng lấn hoặc liền kề (End A >= Start B)
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

    // Logic gộp Input DTO (Dùng cho Overwrite)
    private List<FreeSlotRequest.TimeRange> mergeInputRanges(List<FreeSlotRequest.TimeRange> ranges) {
        if (ranges == null || ranges.isEmpty()) return new ArrayList<>();
        ranges.sort(Comparator.comparing(FreeSlotRequest.TimeRange::getStartTime));
        List<FreeSlotRequest.TimeRange> result = new ArrayList<>();
        FreeSlotRequest.TimeRange current = ranges.get(0);

        for (int i = 1; i < ranges.size(); i++) {
            FreeSlotRequest.TimeRange next = ranges.get(i);
            if (!current.getEndTime().isBefore(next.getStartTime())) {
                LocalTime maxEnd = current.getEndTime().isAfter(next.getEndTime()) ? current.getEndTime() : next.getEndTime();
                current.setEndTime(maxEnd); // DTO phải có setter EndTime
            } else {
                result.add(current);
                current = next;
            }
        }
        result.add(current);
        return result;
    }

    // Các hàm phụ trợ khác (Get Appointments, Check Orphan, Create, Convert)
    private List<Appointment> getActiveAppointments(Long tutorId, LocalDate date) {
        List<Appointment> all = new ArrayList<>();
        all.addAll(meetingRepo.findPendingAppointmentsByTutor(tutorId));
        all.addAll(meetingRepo.findApprovedAppointmentsByTutor(tutorId));
        return all.stream()
                .filter(a -> a.getStartTime().toLocalDate().equals(date))
                .filter(a -> a.getStatus() != MeetingStatus.CANCELLED)
                .sorted(Comparator.comparing(Appointment::getStartTime))
                .collect(Collectors.toList());
    }

    private void checkOrphanAppointments(List<Appointment> appointments, List<FreeSlotRequest.TimeRange> ranges, List<String> warnings) {
        for (Appointment appt : appointments) {
            boolean isCovered = false;
            LocalTime s = appt.getStartTime().toLocalTime();
            LocalTime e = appt.getEndTime().toLocalTime();
            for (FreeSlotRequest.TimeRange range : ranges) {
                if (isOverlapping(s, e, range.getStartTime(), range.getEndTime())) {
                    isCovered = true; break;
                }
            }
            if (!isCovered) warnings.add("Cảnh báo: Cuộc hẹn " + s + "-" + e + " nằm ngoài lịch rảnh mới.");
        }
    }

    private TutorSlot createSlot(Long tutorId, LocalDate date, LocalTime start, LocalTime end) {
        
        return new TutorSlot(tutorId, date, start, end);
    }

    private FreeSlotResponse convertToResponse(Long tutorId, LocalDate date, List<TutorSlot> slots) {
        FreeSlotResponse res = new FreeSlotResponse();
        res.setTutorId(tutorId);
        res.setDate(date);
        res.setStatus(slots.isEmpty() ? "EMPTY" : "AVAILABLE");
        List<FreeSlotResponse.TimeRange> ranges = slots.stream()
                .map(s -> new FreeSlotResponse.TimeRange(s.getStartTime(), s.getEndTime()))
                .sorted(Comparator.comparing(FreeSlotResponse.TimeRange::getStartTime))
                .collect(Collectors.toList());
        res.setTimeRanges(ranges);
        return res;
    }
    public List<TutorSlot> getRawAvailableSlots(Long tutorId, LocalDate date) {
    // Gọi trực tiếp Repository để lấy dữ liệu Entity thô
    return repo.findAvailableByTutorIdAndDate(tutorId, date);
}
}