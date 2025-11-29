package com.project.happy.service.freeslot;

import java.time.LocalDate;
import java.time.LocalTime; // Nhớ import cái này
import java.util.List;

import com.project.happy.dto.freeslot.FreeSlotRequest; // Nhớ import cái này
import com.project.happy.dto.freeslot.FreeSlotResponse;
import com.project.happy.entity.TutorSlot;

public interface IFreeSlotService {
    
    // --- CHO FRONTEND (TUTOR) ---
    FreeSlotResponse getDailySchedule(Long tutorId, LocalDate date);
    List<FreeSlotResponse> getMonthlySchedule(Long tutorId, int month, int year);
    List<String> overwriteDailySchedule(Long tutorId, FreeSlotRequest request);
    List<TutorSlot> getRawAvailableSlots(Long tutorId, LocalDate date);
    // --- CHO BACKEND KHÁC GỌI (MODULE APPOINTMENT) ---
    
    /**
     * Hàm này được gọi khi Học viên đặt lịch thành công (PENDING).
     * Nhiệm vụ: 
     * 1. Tìm trong list AVAILABLE.
     * 2. Cắt slot đó ra.
     * 3. Chuyển phần bị cắt sang list BOOKED.
     */
    void reserveSlot(Long tutorId, LocalDate date, LocalTime start, LocalTime end);

    /**
     * Hàm này được gọi khi Cuộc hẹn bị Hủy hoặc Từ chối.
     * Nhiệm vụ:
     * 1. Tìm trong list BOOKED.
     * 2. Xóa khỏi BOOKED.
     * 3. Trả về list AVAILABLE (và gộp lại nếu liền kề).
     */
    void releaseSlot(Long tutorId, LocalDate date, LocalTime start, LocalTime end);
}