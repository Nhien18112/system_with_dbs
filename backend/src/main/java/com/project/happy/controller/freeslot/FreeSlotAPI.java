package com.project.happy.controller.freeslot;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.happy.dto.freeslot.FreeSlotRequest;
import com.project.happy.dto.freeslot.FreeSlotResponse;
import com.project.happy.service.freeslot.IFreeSlotService;

@RestController
@RequestMapping("/freeslots")
@CrossOrigin(origins = "http://localhost:3000") // Mở cổng cho React
public class FreeSlotAPI {

    @Autowired
    private IFreeSlotService service;

    // API Xem chi tiết ngày (GET)
    @GetMapping("/daily")
    public ResponseEntity<FreeSlotResponse> getDaily(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        Long tutorId = 13L;
        return ResponseEntity.ok(service.getDailySchedule(tutorId, date));
    }

    // API Xem lịch tháng (GET)
    @GetMapping("/monthly")
    public ResponseEntity<List<FreeSlotResponse>> getMonthly(
            @RequestParam int month, 
            @RequestParam int year
    ) {
        Long tutorId = 1L; // Mock ID
        return ResponseEntity.ok(service.getMonthlySchedule(tutorId, month, year));
    }

    // API Lưu lịch - Ghi đè (POST)
    @PostMapping("/daily")
    public ResponseEntity<?> overwriteSchedule(@RequestBody FreeSlotRequest request) {
        Long tutorId = 13L; // Mock ID
        try {
            // Gọi Service và nhận về danh sách cảnh báo (nếu có)
            List<String> warnings = service.overwriteDailySchedule(tutorId, request);
            
            // Trả về 200 OK kèm danh sách cảnh báo
            return ResponseEntity.ok(warnings);
            
        } catch (RuntimeException e) { 
            // SỬA LỖI TẠI ĐÂY: Chỉ cần catch RuntimeException là đủ
            // Nó sẽ bắt cả IllegalArgumentException (lỗi validate) và lỗi xung đột lịch
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}