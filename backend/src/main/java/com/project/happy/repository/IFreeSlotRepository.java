package com.project.happy.repository;

import com.project.happy.entity.TutorSlot;
import java.time.LocalDate;
import java.util.List;

public interface IFreeSlotRepository {
    List<TutorSlot> findByTutorIdAndDate(Long tutorId, LocalDate date);
    List<TutorSlot> findByTutorIdAndDateBetween(Long tutorId, int month, int year);
    void deleteByTutorIdAndDate(Long tutorId, LocalDate date);
    void saveAll(List<TutorSlot> slots);
}