package com.project.happy.controller.scheduling;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.happy.dto.scheduling.ApproveRequest;
import com.project.happy.dto.scheduling.CancelRequest;
import com.project.happy.dto.scheduling.RejectRequest;
import com.project.happy.entity.Appointment;
import com.project.happy.entity.Meeting;
import com.project.happy.service.scheduling.ITutorSchedulingService;

@RestController
@RequestMapping("/api/tutor/scheduling")
public class TutorSchedulingAPI {

    private final ITutorSchedulingService tutorService;

    public TutorSchedulingAPI(ITutorSchedulingService tutorService) {
        this.tutorService = tutorService;
    }

    // =================== Appointments ===================
    @GetMapping("/appointments/pending")
    public ResponseEntity<List<Appointment>> pending(@RequestParam Long tutorId) {
        List<Appointment> list = tutorService.viewPendingAppointments(tutorId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/appointments/{id}/approve")
    public ResponseEntity<String> approve(@PathVariable Long id, @RequestBody ApproveRequest req) {
        boolean result = tutorService.approveAppointment(id, req.getTutorId());
        if (result) {
            return ResponseEntity.ok("Appointment approved successfully");
        } else {
            return ResponseEntity.badRequest()
                    .body("Cannot approve appointment (maybe already approved or rejected)");
        }
    }

    @PostMapping("/appointments/{id}/reject")
    public ResponseEntity<String> reject(@PathVariable Long id, @RequestBody RejectRequest req) {
        // Validation lý do reject
        if (req.getReason() == null || req.getReason().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Reason for rejection must not be empty");
        }

        boolean result = tutorService.rejectAppointment(id, req.getTutorId(), req.getReason());
        if (result) {
            return ResponseEntity.ok("Appointment rejected successfully");
        } else {
            return ResponseEntity.badRequest().body("Cannot reject appointment (maybe already approved or rejected)");
        }
    }

    // =================== Meetings ===================

    @GetMapping("/meetings/official")
    public ResponseEntity<List<Meeting>> official(@RequestParam Long tutorId) {
        List<Meeting> list = tutorService.viewOfficialMeetings(tutorId); // có thể là Appointment + các loại Meeting //
        return ResponseEntity.ok(list);
    }

    @PostMapping("/meetings/{id}/cancel")
    public ResponseEntity<String> cancel(@PathVariable Long id, @RequestBody CancelRequest req) {
        boolean result = tutorService.cancelMeeting(req.getUserId(), id, req.getReason());
        if (result) {
            return ResponseEntity.ok("Meeting cancelled successfully");
        } else {
            return ResponseEntity.badRequest().body("Cannot cancel meeting");
        }
    }

    @PostMapping("/tutor/{tutorId}/meetings/{meetingId}/return-slot")
    public ResponseEntity<?> returnSlot(@PathVariable Long id, @PathVariable Long meetingId) {
        boolean ok = tutorService.tutorReturnCancelledSlot(id, meetingId);
        if (!ok) {
            return ResponseEntity.ok("Tutor chọn KHÔNG trả lại slot.");
        }
        return ResponseEntity.ok("Slot đã trả vào lịch rảnh.");
    }

    @GetMapping("/meeting/{id}")
    public ResponseEntity<Meeting> detail(@PathVariable Long id) {
        Meeting meeting = tutorService.viewMeetingDetails(id);
        if (meeting != null) {
            return ResponseEntity.ok(meeting);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}