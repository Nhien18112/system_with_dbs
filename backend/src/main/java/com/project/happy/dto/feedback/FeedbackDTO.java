package com.project.happy.dto.feedback;

public class FeedbackDTO {
    private Long meetingID; 
    private Integer rating;
    private String comment;

    public FeedbackDTO() {
    }

    public FeedbackDTO(Long meetingID, Integer rating, String comment) {
        this.meetingID = meetingID;
        this.rating = rating;
        this.comment = comment;
    }

    public Long getMeetingID() { return meetingID; }
    public void setMeetingID(Long meetingID) { this.meetingID = meetingID; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}