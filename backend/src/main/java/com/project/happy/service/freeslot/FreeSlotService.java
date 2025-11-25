package com.project.happy.service.freeslot;

import com.project.happy.dto.freeslot.FreeSlotRequest;
import com.project.happy.dto.freeslot.FreeSlotResponse;
import com.project.happy.entity.TutorSlot;
import com.project.happy.repository.IFreeSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FreeSlotService implements IFreeSlotService {

    @Autowired
    private IFreeSlotRepository repo;

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
    public void overwriteDailySchedule(Long tutorId, FreeSlotRequest request) {
        // 1. Xóa sạch lịch cũ của ngày đó (Logic Ghi Đè)
        repo.deleteByTutorIdAndDate(tutorId, request.getDate());

        // 2. Chuyển DTO thành Entity mới
        List<TutorSlot> newSlots = new ArrayList<>();
        if (request.getTimeRanges() != null) {
            for (FreeSlotRequest.TimeRange range : request.getTimeRanges()) {
                TutorSlot slot = new TutorSlot();
                slot.setTutorId(tutorId);
                slot.setDate(request.getDate());
                slot.setStartTime(range.getStartTime());
                slot.setEndTime(range.getEndTime());
                newSlots.add(slot);
            }
            // 3. Lưu danh sách mới
            repo.saveAll(newSlots);
        }
    }

    // Helper map data
    private FreeSlotResponse convertToResponse(Long tutorId, LocalDate date, List<TutorSlot> slots) {
        FreeSlotResponse res = new FreeSlotResponse();
        res.setTutorId(tutorId);
        res.setDate(date);
        res.setStatus(slots.isEmpty() ? "EMPTY" : "AVAILABLE");
        
        List<FreeSlotResponse.TimeRange> ranges = slots.stream()
                .map(s -> new FreeSlotResponse.TimeRange(s.getStartTime(), s.getEndTime()))
                .collect(Collectors.toList());
        res.setTimeRanges(ranges);
        return res;
    }
}