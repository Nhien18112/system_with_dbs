package com.project.happy.entity;

import java.time.LocalDateTime;


public abstract class Meeting {

    private Long meetingId;
    private Long tutorId;
    
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String topic;
    private String cancellationReason;
    private boolean cancelled;
    private String onlineLink;
    private MeetingType type;
    private MeetingStatus status;

    public Meeting(Long meetingId,Long tutorId,LocalDateTime startTime,LocalDateTime endTime,String topic,MeetingType type) {

        this.meetingId = meetingId;
        this.tutorId = tutorId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.topic = topic;
        this.type = type;

        this.status = MeetingStatus.SCHEDULED;
        this.cancelled = false;
        this.cancellationReason = null;
        this.onlineLink = null;
    }

    public boolean cancel(String reason) {
        if (this.status == MeetingStatus.COMPLETED || this.cancelled) return false;
        this.cancelled = true;
        this.cancellationReason = reason;
        this.status = MeetingStatus.CANCELLED;
        return true;
    }

    public void updateStatus(LocalDateTime now) {
        if (cancelled) return;
        if (now.isAfter(endTime)) status = MeetingStatus.COMPLETED;
        else if (now.isAfter(startTime)) status = MeetingStatus.ONGOING;
        else status = MeetingStatus.SCHEDULED;
    }

    // Getters & Setters
    public Long getMeetingId() { return meetingId; }
    public Long getTutorId() { return tutorId; }
    
    public LocalDateTime getStartTime() { return startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public String getTopic() { return topic; }
    public boolean isCancelled() { return cancelled; }
    public String getCancellationReason() { return cancellationReason; }
    public String getOnlineLink() { return onlineLink; }
    public MeetingType getType() { return type; }
    public MeetingStatus getStatus() { return status; }

    public void setTopic(String topic) { this.topic = topic; }
    public void setOnlineLink(String onlineLink) { this.onlineLink = onlineLink; }
    public void setStatus(MeetingStatus status) { this.status = status; }
}