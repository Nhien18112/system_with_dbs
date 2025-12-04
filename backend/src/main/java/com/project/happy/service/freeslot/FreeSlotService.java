package com.project.happy.service.freeslot;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.project.happy.dto.freeslot.FreeSlotRequest;
import com.project.happy.dto.freeslot.FreeSlotResponse;
import com.project.happy.entity.TutorAvailability; // 💡 Dùng Entity mới
import com.project.happy.repository.IFreeSlotRepository;
import com.project.happy.service.freeslot.strategy.SlotOperationStrategy;
import com.project.happy.service.freeslot.validation.ScheduleValidator;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.Comparator; 
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FreeSlotService implements IFreeSlotService {

    // Khai báo các hằng số Status để sử dụng nhất quán
    private static final TutorAvailability.Status AVAILABLE_STATUS = TutorAvailability.Status.AVAILABLE;

    @Autowired private IFreeSlotRepository repo;
    private final Map<String, SlotOperationStrategy> strategyMap;
    private final List<ScheduleValidator> validators;
    
    @Autowired
    public FreeSlotService(Map<String, SlotOperationStrategy> strategyMap,
                           List<ScheduleValidator> validators) {
        this.strategyMap = strategyMap;
        this.validators = validators;
    }

    // --- GET DAILY DATA ---
    @Override
    public FreeSlotResponse getDailySchedule(Long tutorId, LocalDate date) {
        // 💡 SỬA: Dùng JPA method mới, trả về List<TutorAvailability>
        List<TutorAvailability> slots = repo.findByTutorIdAndAvailableDateAndStatus(
            tutorId, date, AVAILABLE_STATUS
        );
        return convertToResponse(tutorId, date, slots); 
    }

    // --- GET MONTHLY DATA ---
    @Override
    public List<FreeSlotResponse> getMonthlySchedule(Long tutorId, int month, int year) {
        
        // 1. Gọi Repository (@Query method)
        List<TutorAvailability> slots = repo.findMonthlySlots(tutorId, month, year, AVAILABLE_STATUS);

        // 2. Lọc ra các slot >= ngày hiện tại
        LocalDate today = LocalDate.now();
        List<TutorAvailability> futureSlots = slots.stream()
            .filter(s -> !s.getAvailableDate().isBefore(today)) // Lấy ngày >= ngày hiện tại
            .collect(Collectors.toList());

        // 3. Nhóm và chuyển đổi sang DTO
        return futureSlots.stream()
            // 💡 SỬA: Dùng getAvailableDate()
            .collect(Collectors.groupingBy(TutorAvailability::getAvailableDate))
            .entrySet().stream()
            .map(entry -> convertToResponse(tutorId, entry.getKey(), entry.getValue()))
            .collect(Collectors.toList());
    }
    
    // 💡 SỬA: Hàm này giờ trả về Entity JPA
    public Optional<TutorAvailability> getAvailabilitySlot(Long tutorId, LocalDate date, LocalTime start, LocalTime end, TutorAvailability.Status status) {
        return Optional.ofNullable(repo.findByTutorIdAndAvailableDateAndStartTimeAndEndTimeAndStatus(
            tutorId, date, start, end, status
        ));
    }
    
    // 💡 SỬA: Hàm này giờ trả về Entity JPA (Sử dụng cho các Service khác nếu cần truy cập raw data)
    public List<TutorAvailability> getRawAvailableSlots(Long tutorId, LocalDate date) {
        return repo.findByTutorIdAndAvailableDateAndStatus(tutorId, date, AVAILABLE_STATUS);
    }

    // --- CÁC HÀM XỬ LÝ CHÍNH (Strategy Pattern) ---
    // Giữ nguyên các hàm này vì chúng gọi strategyMap. 
    // CHỈ CẦN ĐẢM BẢO CÁC LỚP IMPLEMENTATION CỦA SlotOperationStrategy
    // ĐÃ ĐƯỢC CẬP NHẬT ĐỂ SỬ DỤNG IFreeSlotRepository MỚI.
    
    @Override
    @Transactional // Thêm @Transactional để đảm bảo DB được cập nhật
    public List<String> overwriteDailySchedule(Long tutorId, FreeSlotRequest request) {
        validators.forEach(v -> v.validate(request));
        // Xóa slot cũ (Hàm này có thể cần được gọi từ Strategy, nhưng nếu gọi ở đây sẽ gọn hơn)
        repo.deleteByTutorIdAndAvailableDate(tutorId, request.getDate()); 
        
        SlotOperationStrategy strategy = strategyMap.get("overwrite");
        if (strategy == null) throw new RuntimeException("Strategy 'overwrite' not found!");
        strategy.execute(tutorId, request);
        return List.of("Cập nhật thành công");
    }

    @Override
    @Transactional
    public void reserveSlot(Long tutorId, LocalDate date, LocalTime start, LocalTime end) {
        FreeSlotRequest req = new FreeSlotRequest();
        req.setDate(date);
        req.setTimeRanges(List.of(new FreeSlotRequest.TimeRange(start, end)));
        strategyMap.get("reserve").execute(tutorId, req);
    }

    @Override
    @Transactional
    public void releaseSlot(Long tutorId, LocalDate date, LocalTime start, LocalTime end) {
        FreeSlotRequest req = new FreeSlotRequest();
        req.setDate(date);
        req.setTimeRanges(List.of(new FreeSlotRequest.TimeRange(start, end)));
        strategyMap.get("release").execute(tutorId, req);
    }

    // HÀM HELPER ĐỂ CHUYỂN ĐỔI CHUNG
    // 💡 SỬA: Giờ nhận List<TutorAvailability>
    private FreeSlotResponse convertToResponse(Long tutorId, LocalDate date, List<TutorAvailability> slots) {
        FreeSlotResponse res = new FreeSlotResponse();
        res.setTutorId(tutorId);
        res.setDate(date);
        
        if (slots != null && !slots.isEmpty()) {
            List<FreeSlotResponse.TimeRange> timeRanges = slots.stream()
                // 💡 SỬA: Dùng TutorAvailability::getStartTime
                .sorted(Comparator.comparing(TutorAvailability::getStartTime)) 
                .map(slot -> new FreeSlotResponse.TimeRange(slot.getStartTime(), slot.getEndTime()))
                .collect(Collectors.toList());
                
            res.setTimeRanges(timeRanges);
            res.setStatus("AVAILABLE");
        } else {
            res.setTimeRanges(Collections.emptyList());
            res.setStatus("EMPTY");
        }
        return res;
    }
}