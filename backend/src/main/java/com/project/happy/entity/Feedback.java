package com.project.happy.entity;

import java.time.LocalDateTime;

public class Feedback {
    private Long feedbackID;
    private Long meetingID;
    private Integer rating;
    private String comment;
    private LocalDateTime submitAt; 

    public Feedback() {  }

    public Feedback(Long feedbackID, Long meetingID, Integer rating, String comment, LocalDateTime submitAt) {
        this.feedbackID = feedbackID;
        this.meetingID = meetingID;
        this.rating = rating;
        this.comment = comment;
        this.submitAt = submitAt;
    }

    public Long getFeedbackID() { return feedbackID; }
    public Long getMeetingID() { return meetingID; }
    public Integer getRating() { return rating; }
    public String getComment() { return comment; }
    public LocalDateTime getSubmitAt() { return submitAt; }
    public void setFeedbackID(Long feedbackID) { this.feedbackID = feedbackID; }
    public void setMeetingID(Long meetingID) { this.meetingID = meetingID; }
    public void setRating(Integer rating) { this.rating = rating; }
    public void setComment(String comment) { this.comment = comment; }
    public void setSubmitAt(LocalDateTime submitAt) { this.submitAt = submitAt; }
}
