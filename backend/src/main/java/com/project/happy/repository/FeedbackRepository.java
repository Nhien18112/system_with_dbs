package com.project.happy.repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.util.List;
import org.springframework.stereotype.Repository;
import java.util.Comparator;
import com.project.happy.entity.Feedback;

@Repository
public class FeedbackRepository implements IFeedbackRepository {
    private List<Feedback> feedbacks = new ArrayList<>();

    public FeedbackRepository() {
        // Du lieu mau
        feedbacks.add(new Feedback(
            1L, 1L, 5, 
            "Bài giảng rất hay", 
            LocalDateTime.now().minusDays(1)
        ));
        
        feedbacks.add(new Feedback(
            2L, 1L, 4, 
            "Hữu ích", 
            LocalDateTime.now()
        ));
    }

    @Override 
    public Feedback save(Feedback feedback) {
         feedbacks.add(feedback);
         return feedback;
    }

    @Override 
    public List<Feedback> findByMeetingID(Long meetingID) {
        return feedbacks.stream()
                .filter(f -> f.getMeetingID().equals(meetingID))
                .sorted(Comparator.comparing(Feedback::getSubmitAt).reversed())
                .collect(Collectors.toList());
    }
}
