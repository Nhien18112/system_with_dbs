package com.project.happy.repository;

import com.project.happy.entity.Meeting;
import java.util.List;

public interface ISchedulingRepository {
    List<Meeting> viewMeetings(Long userId);
    boolean cancelMeeting(Long meetingId, Long userId, String reason);
}
