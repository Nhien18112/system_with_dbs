package com.project.happy.entity;

import java.time.LocalDateTime;

public abstract class Meeting {

    protected Long meetingId;
    protected Long tutorId;
    protected LocalDateTime date;
    protected LocalDateTime startTime;
    protected LocalDateTime endTime;
    protected String topic;
    protected String cancellationReason;
    protected boolean cancelled;
    protected MeetingType type;
    protected MeetingStatus status;

    // Constructor
    public Meeting(Long meetingId, Long tutorId, LocalDateTime date, LocalDateTime startTime,
                   LocalDateTime endTime, String topic, MeetingType type) {
        this.meetingId = meetingId;
        this.tutorId = tutorId;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.topic = topic;
        this.type = type;
        this.status = MeetingStatus.SCHEDULED;
        this.cancelled = false;
    }

    // Core Methods
    public boolean cancel(Long userId, String reason) {
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

    public boolean overlapsWith(Meeting other) {
        return this.tutorId.equals(other.tutorId)
            && !this.endTime.isBefore(other.startTime)
            && !this.startTime.isAfter(other.endTime);
    }

    // Getters & Setters
    public Long getMeetingId() { return meetingId; }
    public Long getTutorId() { return tutorId; }
    public LocalDateTime getDate() { return date; }
    public LocalDateTime getStartTime() { return startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public String getTopic() { return topic; }
    public boolean isCancelled() { return cancelled; }
    public MeetingStatus getStatus() { return status; }
    public MeetingType getType() { return type; }
    public String getCancellationReason() { return cancellationReason; }

    public void setTopic(String topic) { this.topic = topic; }
}
