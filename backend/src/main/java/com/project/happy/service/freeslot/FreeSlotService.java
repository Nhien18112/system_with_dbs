package com.project.happy.service.freeslot;

import com.project.happy.dto.freeslot.FreeSlotRequest;
import com.project.happy.dto.freeslot.FreeSlotResponse;
import com.project.happy.entity.Appointment;
import com.project.happy.entity.MeetingStatus;
import com.project.happy.entity.TutorSlot;
import com.project.happy.repository.IFreeSlotRepository;
import com.project.happy.repository.IMeetingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FreeSlotService implements IFreeSlotService {

    @Autowired
    private IFreeSlotRepository repo;

    @Autowired
    private IMeetingRepository meetingRepo;

    @Override
    public FreeSlotResponse getDailySchedule(Long tutorId, LocalDate date) {
        List<TutorSlot> slots = repo.findByTutorIdAndDate(tutorId, date);
        return convertToResponse(tutorId, date, slots);
    }

    @Override
    public List<FreeSlotResponse> getMonthlySchedule(Long tutorId, int month, int year) {
        List<TutorSlot> slots = repo.findByTutorIdAndDateBetween(tutorId, month, year);
        return slots.stream()
                .collect(Collectors.groupingBy(TutorSlot::getDate))
                .entrySet().stream()
                .map(entry -> convertToResponse(tutorId, entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<String> overwriteDailySchedule(Long tutorId, FreeSlotRequest request) {
        LocalDate targetDate = request.getDate();
        List<FreeSlotRequest.TimeRange> rawRanges = request.getTimeRanges();
        List<String> warnings = new ArrayList<>();

        // 1. VALIDATE: Giờ bắt đầu < Kết thúc
        if (rawRanges != null) {
            for (FreeSlotRequest.TimeRange range : rawRanges) {
                if (!range.getStartTime().isBefore(range.getEndTime())) {
                    throw new IllegalArgumentException("Lỗi: Giờ bắt đầu (" + range.getStartTime() + 
                                                     ") phải nhỏ hơn giờ kết thúc (" + range.getEndTime() + ")");
                }
            }
        }

        // 2. GỘP LỊCH TRÙNG (Merge Overlap)
        List<FreeSlotRequest.TimeRange> mergedRanges = mergeTimeRanges(rawRanges);

        // 3. LẤY DANH SÁCH CUỘC HẸN HIỆN CÓ
        List<Appointment> allAppointments = new ArrayList<>();
        allAppointments.addAll(meetingRepo.findPendingAppointmentsByTutor(tutorId));
        allAppointments.addAll(meetingRepo.findApprovedAppointmentsByTutor(tutorId));

        List<Appointment> existingAppointments = allAppointments.stream()
                .filter(a -> a.getStartTime().toLocalDate().equals(targetDate))
                .filter(a -> a.getStatus() != MeetingStatus.CANCELLED)
                .sorted(Comparator.comparing(Appointment::getStartTime))
                .collect(Collectors.toList());

        // 4. CHECK: Cảnh báo nếu cuộc hẹn nằm hoàn toàn ngoài lịch rảnh
        for (Appointment appt : existingAppointments) {
            boolean isCovered = false;
            LocalTime s = appt.getStartTime().toLocalTime();
            LocalTime e = appt.getEndTime().toLocalTime();

            for (FreeSlotRequest.TimeRange range : mergedRanges) {
                // Kiểm tra có giao nhau chút nào không
                if (s.isBefore(range.getEndTime()) && e.isAfter(range.getStartTime())) {
                    isCovered = true;
                    break;
                }
            }
            if (!isCovered) {
                warnings.add("Cảnh báo: Bạn có cuộc hẹn lúc " + s + " - " + e + 
                             " không nằm trong bất kỳ khung giờ rảnh nào mới.");
            }
        }

        // 5. XÓA CŨ & LƯU MỚI (Cắt giờ thông minh)
        repo.deleteByTutorIdAndDate(tutorId, targetDate);
        List<TutorSlot> slotsToSave = new ArrayList<>();

        if (mergedRanges != null) {
            for (FreeSlotRequest.TimeRange range : mergedRanges) {
                // Tìm các cuộc hẹn CÓ DÍNH DÁNG (Overlap) tới khung giờ này
                List<Appointment> overlaps = existingAppointments.stream()
                    .filter(a -> {
                        LocalTime as = a.getStartTime().toLocalTime();
                        LocalTime ae = a.getEndTime().toLocalTime();
                        // Logic Overlap: Start A < End B && Start B < End A
                        return as.isBefore(range.getEndTime()) && ae.isAfter(range.getStartTime());
                    })
                    .collect(Collectors.toList());

                if (overlaps.isEmpty()) {
                    // Không dính cuộc hẹn -> Lưu nguyên cục
                    slotsToSave.add(createSlot(tutorId, targetDate, range.getStartTime(), range.getEndTime()));
                } else {
                    // CÓ TRÙNG -> Cắt giờ
                    warnings.add("Khung giờ " + range.getStartTime() + "-" + range.getEndTime() + 
                                 " đã được tự động cắt để tránh trùng với " + overlaps.size() + " cuộc hẹn.");

                    LocalTime currentStart = range.getStartTime();
                    
                    for (Appointment appt : overlaps) {
                        LocalTime apptStart = appt.getStartTime().toLocalTime();
                        LocalTime apptEnd = appt.getEndTime().toLocalTime();

                        // 1. Lưu phần rảnh TRƯỚC cuộc hẹn (nếu có)
                        // Ví dụ: Rảnh 8:00, Hẹn 9:00 -> Lưu 8:00-9:00
                        if (currentStart.isBefore(apptStart)) {
                            // Đảm bảo không lưu vượt quá giới hạn của range gốc
                            // (Trường hợp hẹn bắt đầu sau khi range kết thúc thì không vào đây do filter rồi)
                            slotsToSave.add(createSlot(tutorId, targetDate, currentStart, apptStart));
                        }
                        
                        // 2. Nhảy cóc qua cuộc hẹn (Cập nhật điểm bắt đầu mới)
                        // Nếu cuộc hẹn kết thúc muộn hơn điểm hiện tại -> Dời điểm hiện tại lên
                        if (apptEnd.isAfter(currentStart)) {
                            currentStart = apptEnd;
                        }
                    }
                    
                    // 3. Lưu phần rảnh SAU cuộc hẹn cuối cùng (nếu còn dư trong range gốc)
                    // Ví dụ: Hẹn xong 10:00, Range đến 11:00 -> Lưu 10:00-11:00
                    // Ví dụ bạn: Hẹn xong 10:00, Range đến 9:30 -> 10:00 không nhỏ hơn 9:30 -> Không lưu
                    if (currentStart.isBefore(range.getEndTime())) {
                        slotsToSave.add(createSlot(tutorId, targetDate, currentStart, range.getEndTime()));
                    }
                }
            }
            repo.saveAll(slotsToSave);
        }

        return warnings;
    }

    // --- Helper Methods ---
    private List<FreeSlotRequest.TimeRange> mergeTimeRanges(List<FreeSlotRequest.TimeRange> ranges) {
        if (ranges == null || ranges.isEmpty()) return new ArrayList<>();
        ranges.sort(Comparator.comparing(FreeSlotRequest.TimeRange::getStartTime));

        List<FreeSlotRequest.TimeRange> result = new ArrayList<>();
        FreeSlotRequest.TimeRange current = ranges.get(0);

        for (int i = 1; i < ranges.size(); i++) {
            FreeSlotRequest.TimeRange next = ranges.get(i);
            if (!current.getEndTime().isBefore(next.getStartTime())) {
                LocalTime maxEnd = current.getEndTime().isAfter(next.getEndTime()) 
                                   ? current.getEndTime() : next.getEndTime();
                FreeSlotRequest.TimeRange merged = new FreeSlotRequest.TimeRange();
                merged.setStartTime(current.getStartTime());
                merged.setEndTime(maxEnd);
                current = merged;
            } else {
                result.add(current);
                current = next;
            }
        }
        result.add(current);
        return result;
    }

    private TutorSlot createSlot(Long tutorId, LocalDate date, LocalTime start, LocalTime end) {
        TutorSlot slot = new TutorSlot();
        slot.setTutorId(tutorId);
        slot.setDate(date);
        slot.setStartTime(start);
        slot.setEndTime(end);
        return slot;
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
}