package com.project.happy.dto.freeslot;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class FreeSlotRequest {
    private LocalDate date;
    private List<TimeRange> timeRanges;

    public static class TimeRange {
        private LocalTime startTime;
        private LocalTime endTime;
        
        // Getters Setters
        public LocalTime getStartTime() { return startTime; }
        public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
        public LocalTime getEndTime() { return endTime; }
        public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public List<TimeRange> getTimeRanges() { return timeRanges; }
    public void setTimeRanges(List<TimeRange> timeRanges) { this.timeRanges = timeRanges; }
}