package com.project.happy.service.feedback;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.List;

import org.springframework.stereotype.Service;

import com.project.happy.dto.feedback.FeedbackDTO;
import com.project.happy.entity.Feedback;
import com.project.happy.repository.IFeedbackRepository;

@Service
public class FeedbackService implements IFeedbackService {
    private final IFeedbackRepository repository;

    public FeedbackService(IFeedbackRepository repository) {
        this.repository = repository;
    }


    //Them feadback vao List
    @Override
    public Feedback addFeedback(FeedbackDTO dto) {
        if (dto.getRating() < 1 || dto.getRating() > 5) {
            throw new RuntimeException("Số sao phải từ 1 đến 5!");
        }

        Feedback entity = new Feedback();
        
        entity.setFeedbackId(new Random().nextLong());
        entity.setMeetingId(dto.getMeetingId());
        entity.setRating(dto.getRating());
        entity.setComment(dto.getComment());
        entity.setSubmitAt(LocalDateTime.now());

        return repository.save(entity);

    }

    //Lay feedback theo ID buoi hop
    @Override
    public List<Feedback> getFeedbackByMeeting(Long meetingId) {
        return repository.findByMeetingId(meetingId);
    }
}
