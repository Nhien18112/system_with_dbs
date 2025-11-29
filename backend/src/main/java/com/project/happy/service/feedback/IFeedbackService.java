package com.project.happy.service.feedback;
import java.util.List;

import com.project.happy.dto.feedback.FeedbackDTO;
import com.project.happy.entity.Feedback;
public interface IFeedbackService {
    Feedback addFeedback(FeedbackDTO dto);
    List<Feedback> getFeedbackByMeeting(Long meetingID);
}
