package com.project.happy.repository;

import com.project.happy.entity.Feedback;
import java.util.List;
public interface IFeedbackRepository {
    Feedback save(Feedback feedback);
    List<Feedback> findByMeetingID(Long meetingID);
}   
