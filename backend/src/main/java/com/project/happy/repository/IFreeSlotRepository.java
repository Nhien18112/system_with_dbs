package com.project.happy.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.project.happy.entity.TutorAvailability;

public interface IFreeSlotRepository extends JpaRepository<TutorAvailability, Integer> {

    // 1. Lấy slot rảnh cho một ngày cụ thể (Lọc theo Status)
    List<TutorAvailability> findByTutorIdAndAvailableDateAndStatus(
        Long tutorId, 
        LocalDate availableDate, 
        TutorAvailability.Status status);

    // 💡 BỔ SUNG FIX LỖI: Lấy tất cả slot (bất kể trạng thái) cho một ngày
    List<TutorAvailability> findByTutorIdAndAvailableDate(
        Long tutorId, 
        LocalDate availableDate); 

    // 2. Lấy slot rảnh theo tháng/năm
    @Query("SELECT t FROM TutorAvailability t WHERE t.tutorId = :tutorId AND " +
           "FUNCTION('MONTH', t.availableDate) = :month AND " +
           "FUNCTION('YEAR', t.availableDate) = :year AND " +
           "t.status = :status")
    List<TutorAvailability> findMonthlySlots(
        @Param("tutorId") Long tutorId, 
        @Param("month") int month, 
        @Param("year") int year,
        @Param("status") TutorAvailability.Status status);

    // 3. Tìm slot cụ thể để ĐẶT LỊCH
    TutorAvailability findByTutorIdAndAvailableDateAndStartTimeAndEndTimeAndStatus(
        Long tutorId, 
        LocalDate availableDate, 
        LocalTime startTime, 
        LocalTime endTime, 
        TutorAvailability.Status status);

    // 4. Xóa/Ghi đè slot
    @Modifying
    void deleteByTutorIdAndAvailableDate(Long tutorId, LocalDate availableDate);
}