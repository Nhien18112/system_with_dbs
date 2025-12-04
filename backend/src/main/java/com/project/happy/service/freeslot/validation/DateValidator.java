package com.project.happy.service.freeslot.validation;

import org.springframework.stereotype.Component;
import com.project.happy.dto.freeslot.FreeSlotRequest;
import java.time.LocalDate;

@Component
public class DateValidator implements ScheduleValidator {
    @Override
    public void validate(FreeSlotRequest request) {
        if (request.getDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Lỗi: Không thể thao tác với ngày trong quá khứ.");
        }
    }
}