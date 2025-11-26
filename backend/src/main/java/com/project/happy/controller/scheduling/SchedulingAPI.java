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
import com.project.happy.dto.scheduling.ApproveRequest;
import com.project.happy.dto.scheduling.CancelRequest;
import com.project.happy.entity.Meeting;
import com.project.happy.service.scheduling.SchedulingService;


@RestController
@RequestMapping("/api/scheduling")
public class SchedulingAPI {

    private final SchedulingService service;

    public SchedulingAPI(SchedulingService service) {
        this.service = service;
    }

    @PostMapping("/appointments")
    public boolean book(@RequestBody AppointmentRequest req) {
        return service.bookAppointment(req);
    }

    @PostMapping("/appointments/{id}/approve")
    public boolean approve(@PathVariable Long id, @RequestBody ApproveRequest req) {
        return service.approveAppointment(id, req);
    }

    @PostMapping("/appointments/{id}/reject")
    public boolean reject(@PathVariable Long id, @RequestBody ApproveRequest req) {
        return service.rejectAppointment(id, req);
    }

    @PostMapping("/meetings/{id}/cancel")
    public boolean cancel(@PathVariable Long id, @RequestBody CancelRequest req) {
        return service.cancelAppointment(id, req);
    }

    @GetMapping("/meetings")
    public List<Meeting> getMeetings(@RequestParam Long userId) {
        return service.getMeetings(userId);
    }
}