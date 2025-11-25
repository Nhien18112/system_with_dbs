package com.project.happy.dto.freeslot;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class FreeSlotResponse {
    private Long tutorId;
    private LocalDate date;
    private List<TimeRange> timeRanges;
    private String status;

    public static class TimeRange {
        private LocalTime startTime;
        private LocalTime endTime;

        public TimeRange(LocalTime startTime, LocalTime endTime) {
            this.startTime = startTime;
            this.endTime = endTime;
        }
        
        public LocalTime getStartTime() { return startTime; }
        public LocalTime getEndTime() { return endTime; }
    }

    public Long getTutorId() { return tutorId; }
    public void setTutorId(Long tutorId) { this.tutorId = tutorId; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public List<TimeRange> getTimeRanges() { return timeRanges; }
    public void setTimeRanges(List<TimeRange> timeRanges) { this.timeRanges = timeRanges; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}