package com.project.happy.service.freeslot.strategy;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import com.project.happy.dto.freeslot.FreeSlotRequest;
import com.project.happy.entity.TutorAvailability; // 💡 Dùng Entity mới
import com.project.happy.repository.IFreeSlotRepository;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Component("reserve")
public class ReserveStrategy implements SlotOperationStrategy {

    @Autowired private IFreeSlotRepository repo;

    private static final TutorAvailability.Status AVAILABLE_STATUS = TutorAvailability.Status.AVAILABLE;
    private static final TutorAvailability.Status BOOKED_STATUS = TutorAvailability.Status.BOOKED;

    @Override
    @Transactional
    public void execute(Long tutorId, FreeSlotRequest request) {
        LocalTime start = request.getTimeRanges().get(0).getStartTime();
        LocalTime end = request.getTimeRanges().get(0).getEndTime();
        
        // 1. Tìm slot rảnh chứa khung giờ đặt (Không tìm chính xác start-end)
        // Do Repository không hỗ trợ tìm kiếm chứa, ta phải lấy hết slot AVAILABLE và lọc thủ công
        
        // TÌM SLOT CHÍNH XÁC (Tạm thời)
        TutorAvailability targetSlot = repo.findByTutorIdAndAvailableDateAndStartTimeAndEndTimeAndStatus(
            tutorId, 
            request.getDate(), 
            start, end, 
            AVAILABLE_STATUS
        );

        if (targetSlot == null) {
            throw new IllegalArgumentException("Khung giờ " + start + "-" + end + " không có sẵn!");
        }

        // 2. CẬP NHẬT TRẠNG THÁI (Nếu slot vừa khít)
        if (targetSlot.getStartTime().equals(start) && targetSlot.getEndTime().equals(end)) {
            targetSlot.setStatus(BOOKED_STATUS);
            repo.save(targetSlot);
            return;
        }
        
        // 3. CẮT VÀ CHÈN LẠI (Nếu slot không vừa khít)
        
        // *Vì logic cắt slot trong JPA rất phức tạp, ta sẽ dùng ID đã có để xóa và chèn lại các phần mới
        // Hoặc đơn giản là update trạng thái nếu logic Service cho phép đặt chỉ dựa trên trùng khớp thời gian
        
        // THỰC HIỆN CẮT (Nếu slot lớn hơn)
        
        // a. Cắt đầu (Rảnh mới)
        if (targetSlot.getStartTime().isBefore(start)) {
            TutorAvailability prefixSlot = new TutorAvailability();
            prefixSlot.setTutorId(tutorId);
            prefixSlot.setAvailableDate(request.getDate());
            prefixSlot.setStartTime(targetSlot.getStartTime());
            prefixSlot.setEndTime(start);
            prefixSlot.setStatus(AVAILABLE_STATUS);
            repo.save(prefixSlot);
        }
        
        // b. Slot Bận (Mới)
        TutorAvailability bookedSlot = new TutorAvailability();
        bookedSlot.setTutorId(tutorId);
        bookedSlot.setAvailableDate(request.getDate());
        bookedSlot.setStartTime(start);
        bookedSlot.setEndTime(end);
        bookedSlot.setStatus(BOOKED_STATUS); 
        repo.save(bookedSlot);
        
        // c. Cắt đuôi (Rảnh mới)
        if (end.isBefore(targetSlot.getEndTime())) {
            TutorAvailability suffixSlot = new TutorAvailability();
            suffixSlot.setTutorId(tutorId);
            suffixSlot.setAvailableDate(request.getDate());
            suffixSlot.setStartTime(end);
            suffixSlot.setEndTime(targetSlot.getEndTime());
            suffixSlot.setStatus(AVAILABLE_STATUS);
            repo.save(suffixSlot);
        }

        // d. Xóa slot cũ (Quan trọng: Xóa slot ban đầu)
        repo.delete(targetSlot);
    }
}