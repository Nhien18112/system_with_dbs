package com.project.happy.repository;

import com.project.happy.entity.TutorSlot;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Repository
public class FreeSlotRepository implements IFreeSlotRepository {

    // Giả lập Database trong RAM
    private final List<TutorSlot> mockDb = new ArrayList<>();
    private final AtomicLong idGenerator = new AtomicLong(1);

    @Override
    public List<TutorSlot> findByTutorIdAndDate(Long tutorId, LocalDate date) {
        return mockDb.stream()
                .filter(s -> s.getTutorId().equals(tutorId) && s.getDate().equals(date))
                .collect(Collectors.toList());
    }

    @Override
    public List<TutorSlot> findByTutorIdAndDateBetween(Long tutorId, int month, int year) {
        return mockDb.stream()
                .filter(s -> s.getTutorId().equals(tutorId) && 
                             s.getDate().getMonthValue() == month && 
                             s.getDate().getYear() == year)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteByTutorIdAndDate(Long tutorId, LocalDate date) {
        mockDb.removeIf(s -> s.getTutorId().equals(tutorId) && s.getDate().equals(date));
    }

    @Override
    public void saveAll(List<TutorSlot> slots) {
        for (TutorSlot slot : slots) {
            if (slot.getId() == null) {
                slot.setId(idGenerator.getAndIncrement()); // Tự sinh ID
            }
            mockDb.add(slot);
        }
    }
}