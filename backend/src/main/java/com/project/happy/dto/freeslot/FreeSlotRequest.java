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
        
        // 1. Constructor rỗng (Bắt buộc để Spring nhận JSON từ Frontend)
        public TimeRange() {
        }

        // 2. Constructor có tham số (THÊM CÁI NÀY ĐỂ HẾT LỖI ĐỎ)
        public TimeRange(LocalTime startTime, LocalTime endTime) {
            this.startTime = startTime;
            this.endTime = endTime;
        }

        // Getters Setters
        public LocalTime getStartTime() { return startTime; }
        public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
        public LocalTime getEndTime() { return endTime; }
        public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    }

    // Getters & Setters cho lớp cha
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public List<TimeRange> getTimeRanges() { return timeRanges; }
    public void setTimeRanges(List<TimeRange> timeRanges) { this.timeRanges = timeRanges; }
}