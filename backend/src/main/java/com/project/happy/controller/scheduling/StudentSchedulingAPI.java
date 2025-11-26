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
import com.project.happy.dto.freeslot.FreeSlotResponse;
import com.project.happy.entity.Meeting;
import com.project.happy.service.scheduling.IStudentSchedulingService;

@RestController
@RequestMapping("/api/student/scheduling")
public class StudentSchedulingAPI {

    private final IStudentSchedulingService studentService;

    public StudentSchedulingAPI(IStudentSchedulingService studentService) {
        this.studentService = studentService;
    }

    @PostMapping("/appointments")
    public boolean book(@RequestBody AppointmentRequest req) {
        return studentService.bookAppointment(
                req.getStudentId(),
                req.getTutorId(),
                req.getDate(),
                req.getStartTime(),
                req.getEndTime(),
                req.getTopic()
        );
    }

    @PostMapping("/meetings/{id}/cancel")
    public boolean cancel(@PathVariable Long id, @RequestBody CancelRequest req) {
        return studentService.cancelMeeting(id, req.getReason());
    }

    @GetMapping("/meetings")
    public List<Appointment> getHistory(@RequestParam Long studentId) {
        return studentService.viewAppointmentHistory(studentId);
    }

    @GetMapping("/available-slots/{tutorId}")
    public List<FreeSlotResponse> viewSlots(@PathVariable Long tutorId) {
        return studentService.viewTutorAvailableSlots(tutorId);
    }

    @GetMapping("/meeting/{id}")
    public Meeting detail(@PathVariable Long id) {
        return studentService.viewMeetingDetails(id);
    }
}
