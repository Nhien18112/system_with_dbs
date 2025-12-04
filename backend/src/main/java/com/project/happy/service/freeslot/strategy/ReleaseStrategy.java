package com.project.happy.service.freeslot.strategy;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import com.project.happy.dto.freeslot.FreeSlotRequest;
import com.project.happy.entity.TutorAvailability; 
import com.project.happy.repository.IFreeSlotRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Component("release")
public class ReleaseStrategy implements SlotOperationStrategy {

    @Autowired private IFreeSlotRepository repo;

    private static final TutorAvailability.Status AVAILABLE_STATUS = TutorAvailability.Status.AVAILABLE;
    private static final TutorAvailability.Status BOOKED_STATUS = TutorAvailability.Status.BOOKED;

    @Override
    @Transactional
    public void execute(Long tutorId, FreeSlotRequest request) {
        LocalDate date = request.getDate();
        LocalTime start = request.getTimeRanges().get(0).getStartTime();
        LocalTime end = request.getTimeRanges().get(0).getEndTime();

        // 1. Lấy tất cả slot (FIX: Sử dụng hàm mới để lấy data từ DB)
        List<TutorAvailability> allSlots = repo.findByTutorIdAndAvailableDate(tutorId, date);
        
        if (allSlots.isEmpty()) return;

        // 2. Tìm các slot Bận (BOOKED) nằm trong khoảng hủy
        List<TutorAvailability> slotsToUpdate = allSlots.stream()
            .filter(slot -> slot.getStatus() == BOOKED_STATUS)
            .filter(slot -> slot.getStartTime().isBefore(end) && slot.getEndTime().isAfter(start))
            .collect(Collectors.toList());

        if (slotsToUpdate.isEmpty()) return;
        
        // 3. Thay đổi trạng thái của các slot này thành AVAILABLE
        slotsToUpdate.forEach(slot -> slot.setStatus(AVAILABLE_STATUS));
        
        // 4. Gộp toàn bộ slot AVAILABLE (cũ + mới) lại
        List<TutorAvailability> slotsAfterUpdate = allSlots.stream()
            .filter(slot -> slot.getStatus() == AVAILABLE_STATUS)
            .collect(Collectors.toList());

        List<TutorAvailability> mergedAvailable = mergeTutorSlots(tutorId, date, slotsAfterUpdate);
        
        // 5. LƯU (Xóa sạch ngày đó và chèn lại)
        // Đây là cách đúng khi thực hiện logic cắt/gộp slot trong JPA
        repo.deleteByTutorIdAndAvailableDate(tutorId, date);
        repo.saveAll(mergedAvailable);
        
        // 6. Chèn lại các slot BOOKED/UNAVAILABLE còn lại
        List<TutorAvailability> remainingSlots = allSlots.stream()
            .filter(slot -> slot.getStatus() != AVAILABLE_STATUS)
            .collect(Collectors.toList());
        repo.saveAll(remainingSlots);
    }
    
    // Hàm merge logic (Giữ nguyên)
    private List<TutorAvailability> mergeTutorSlots(Long tutorId, LocalDate date, List<TutorAvailability> slots) {
        if (slots == null || slots.isEmpty()) return new ArrayList<>();
        slots.sort(Comparator.comparing(TutorAvailability::getStartTime));
        
        List<TutorAvailability> result = new ArrayList<>();
        TutorAvailability current = slots.get(0);

        for (int i = 1; i < slots.size(); i++) {
            TutorAvailability next = slots.get(i);
            if (!current.getEndTime().isBefore(next.getStartTime())) {
                // Gộp: Cập nhật EndTime của current
                LocalTime maxEnd = current.getEndTime().isAfter(next.getEndTime()) ? current.getEndTime() : next.getEndTime();
                current.setEndTime(maxEnd);
            } else {
                result.add(current);
                current = next;
            }
        }
        result.add(current);
        
        // Đặt ID cho các slot mới/gộp
        result.forEach(s -> s.setStatus(AVAILABLE_STATUS));
        
        return result;
    }
}