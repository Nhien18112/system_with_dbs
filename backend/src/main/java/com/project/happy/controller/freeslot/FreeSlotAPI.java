package com.project.happy.controller.freeslot;

import com.project.happy.dto.freeslot.FreeSlotRequest;
import com.project.happy.dto.freeslot.FreeSlotResponse;
import com.project.happy.service.freeslot.IFreeSlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/freeslots")
public class FreeSlotAPI {

    @Autowired
    private IFreeSlotService service;

    // API Xem chi tiết ngày (GET)
    @GetMapping("/daily")
    public ResponseEntity<FreeSlotResponse> getDaily(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        Long tutorId = 1L; // Mock ID
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
        Long tutorId = 1L; // Mock ID
        service.overwriteDailySchedule(tutorId, request);
        return ResponseEntity.ok("Cập nhật lịch thành công!");
    }
}