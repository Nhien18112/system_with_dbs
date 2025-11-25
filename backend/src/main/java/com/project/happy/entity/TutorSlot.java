package com.project.happy.entity;

import java.time.LocalDate;
import java.time.LocalTime;

public class TutorSlot {
    private Long id;
    private Long tutorId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

    public TutorSlot() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getTutorId() { return tutorId; }
    public void setTutorId(Long tutorId) { this.tutorId = tutorId; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
}