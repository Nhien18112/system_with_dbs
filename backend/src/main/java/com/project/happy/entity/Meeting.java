package com.project.happy.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;

@MappedSuperclass // Không tạo bảng riêng, các con sẽ kế thừa cột
public abstract class Meeting {

    @Column(name = "tutor_id")
    private Long tutorId;
    
    @Column(name = "start_time")
    private LocalDateTime startTime;
    
    @Column(name = "end_time")
    private LocalDateTime endTime;
    
    @Column(name = "topic")
    private String topic;
    
    @Column(name = "cancellation_reason")
    private String cancellationReason;
    
    // Đã đổi boolean -> Boolean để tránh lỗi NULL
    @Column(name = "is_cancelled") 
    private Boolean cancelled = false; 
    
    @Column(name = "online_link")
    private String onlineLink;
    
    // Status chung (SCHEDULED, COMPLETED...)
    @Enumerated(EnumType.STRING)
    @Column(name = "status") 
    private MeetingStatus status;

    public Meeting() {}

    public Meeting(Long tutorId, LocalDateTime startTime, LocalDateTime endTime, String topic, MeetingType type) {
        this.tutorId = tutorId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.topic = topic;
        this.status = MeetingStatus.SCHEDULED;
        this.cancelled = false;
    }

    // --- Logic Cancel / Update Status ---
    public boolean cancel(String reason) {
        if (this.status == MeetingStatus.COMPLETED || Boolean.TRUE.equals(this.cancelled)) {
            return false;
        }
        this.cancelled = true;
        this.cancellationReason = reason;
        this.status = MeetingStatus.CANCELLED;
        return true;
    }

    public void updateStatus(LocalDateTime now) {
        if (Boolean.TRUE.equals(cancelled)) {
            this.status = MeetingStatus.CANCELLED;
            return;
        }
        if (endTime != null && now.isAfter(endTime)) status = MeetingStatus.COMPLETED;
        else if (startTime != null && now.isAfter(startTime)) status = MeetingStatus.ONGOING;
        else status = MeetingStatus.SCHEDULED;
    }

    // --- Getters & Setters (Bắt buộc) ---
    public Long getTutorId() { return tutorId; }
    public void setTutorId(Long tutorId) { this.tutorId = tutorId; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
    public Boolean isCancelled() { return cancelled != null && cancelled; }
    public void setCancelled(Boolean cancelled) { this.cancelled = cancelled; }
    public String getOnlineLink() { return onlineLink; }
    public void setOnlineLink(String onlineLink) { this.onlineLink = onlineLink; }
    public MeetingStatus getStatus() { return status; }
    public void setStatus(MeetingStatus status) { this.status = status; }
}