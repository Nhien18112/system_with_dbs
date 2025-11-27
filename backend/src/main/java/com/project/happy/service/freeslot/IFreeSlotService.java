package com.project.happy.service.freeslot;

import com.project.happy.dto.freeslot.FreeSlotRequest;
import com.project.happy.dto.freeslot.FreeSlotResponse;
import java.time.LocalDate;
import java.util.List;

public interface IFreeSlotService {
    FreeSlotResponse getDailySchedule(Long tutorId, LocalDate date);
    List<FreeSlotResponse> getMonthlySchedule(Long tutorId, int month, int year);
    List<String> overwriteDailySchedule(Long tutorId, FreeSlotRequest request);
}