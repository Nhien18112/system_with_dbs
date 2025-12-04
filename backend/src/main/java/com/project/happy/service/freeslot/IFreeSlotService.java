package com.project.happy.service.freeslot;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.project.happy.dto.freeslot.FreeSlotRequest;
import com.project.happy.dto.freeslot.FreeSlotResponse;
import com.project.happy.entity.TutorAvailability;

public interface IFreeSlotService {
    
    // GET
    FreeSlotResponse getDailySchedule(Long tutorId, LocalDate date);
    List<FreeSlotResponse> getMonthlySchedule(Long tutorId, int month, int year);
    
    // CUD (Create, Update, Delete)
    List<String> overwriteDailySchedule(Long tutorId, FreeSlotRequest request);
    List<TutorAvailability> getRawAvailableSlots(Long tutorId, LocalDate date);
    void reserveSlot(Long tutorId, LocalDate date, LocalTime start, LocalTime end);
    void releaseSlot(Long tutorId, LocalDate date, LocalTime start, LocalTime end);
}