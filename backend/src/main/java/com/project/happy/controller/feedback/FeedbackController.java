package com.project.happy.controller.feedback;

import com.project.happy.dto.feedback.FeedbackDTO;
import com.project.happy.entity.Feedback;
import com.project.happy.service.feedback.FeedbackService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {

    private final FeedbackService service;

    public FeedbackController(FeedbackService service) {
        this.service = service;
    }
    //Nhan feedback
    @PostMapping
    public Feedback submitFeedback(@RequestBody FeedbackDTO feedbackDTO) {
        return service.addFeedback(feedbackDTO);
    }

   //Lay feedback theo ID buoi hop
    @GetMapping
    public List<Feedback> getFeedbacks(@RequestParam Long meetingId) {
        return service.getFeedbackByMeeting(meetingId);
    }
}