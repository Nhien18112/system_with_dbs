package com.project.happy.service.freeslot.validation;

import org.springframework.stereotype.Component;
import com.project.happy.dto.freeslot.FreeSlotRequest;

@Component
public class TimeRangeValidator implements ScheduleValidator {
    @Override
    public void validate(FreeSlotRequest request) {
        if (request.getTimeRanges() != null) {
            request.getTimeRanges().forEach(range -> {
                if (!range.getStartTime().isBefore(range.getEndTime())) {
                    throw new IllegalArgumentException("Lỗi: Giờ bắt đầu phải nhỏ hơn giờ kết thúc (" 
                        + range.getStartTime() + " - " + range.getEndTime() + ")");
                }
            });
        }
    }
}