package com.project.happy.service.freeslot.validation;

import com.project.happy.dto.freeslot.FreeSlotRequest;

public interface ScheduleValidator {
    void validate(FreeSlotRequest request);
}