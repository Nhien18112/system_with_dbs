package com.project.happy.controller.scheduling;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.happy.dto.scheduling.AppointmentRequest;
import com.project.happy.entity.Appointment;
import com.project.happy.dto.scheduling.ApproveRequest;
import com.project.happy.dto.scheduling.CancelRequest;
import com.project.happy.entity.Meeting;
import com.project.happy.service.scheduling.ITutorSchedulingService;


@RestController
@RequestMapping("/api/tutor/scheduling")
public class TutorSchedulingAPI {

    private final ITutorSchedulingService tutorService;

    public TutorSchedulingAPI(ITutorSchedulingService tutorService) {
        this.tutorService = tutorService;
    }

    @GetMapping("/appointments/pending")
    public List<Appointment> pending(@RequestParam Long tutorId) {
        return tutorService.viewPendingAppointments(tutorId);
    }

    @PostMapping("/appointments/{id}/approve")
    public String approve(@PathVariable Long id, @RequestBody ApproveRequest req) {
        return tutorService.approveAppointment(id, req.getTutorId());
    }

    @PostMapping("/appointments/{id}/reject")
    public boolean reject(@PathVariable Long id, @RequestBody ApproveRequest req) {
        return tutorService.rejectAppointment(id, req.getTutorId());
    }

    @GetMapping("/appointments/approved")
    public List<Appointment> approved(@RequestParam Long tutorId) {
        return tutorService.viewApprovedAppointments(tutorId);
    }

    @PostMapping("/meetings/{id}/cancel")
    public boolean cancel(@PathVariable Long id, @RequestBody CancelRequest req) {
        return tutorService.cancelMeeting(req.getUserId(), id, req.getReason());
    }

    @GetMapping("/meeting/{id}")
    public Meeting detail(@PathVariable Long id) {
        return tutorService.viewMeetingDetails(id);
    }
}
