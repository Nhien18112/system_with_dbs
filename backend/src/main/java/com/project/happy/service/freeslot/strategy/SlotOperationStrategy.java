package com.project.happy.service.freeslot.strategy;

import com.project.happy.dto.freeslot.FreeSlotRequest;

public interface SlotOperationStrategy {
    void execute(Long tutorId, FreeSlotRequest request);
}