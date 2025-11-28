package com.project.happy.controller.scheduling;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.happy.dto.freeslot.FreeSlotResponse;
import com.project.happy.dto.scheduling.AppointmentRequest;
import com.project.happy.dto.scheduling.CancelRequest;
import com.project.happy.entity.Appointment;
import com.project.happy.entity.Meeting;
import com.project.happy.service.scheduling.IStudentSchedulingService;


@CrossOrigin(origins = "http://localhost:3000")  // CHÈN DÒNG NÀY
@RestController
@RequestMapping("/api/student/scheduling")
public class StudentSchedulingAPI {

    private final IStudentSchedulingService studentService;

    public StudentSchedulingAPI(IStudentSchedulingService studentService) {
        this.studentService = studentService;
    }

    // =================== Book Appointment ===================
    @PostMapping("/appointments")
    public ResponseEntity<String> book(@RequestBody AppointmentRequest req) {
        boolean success = studentService.bookAppointment(
                req.getStudentId(),
                req.getTutorId(),
                req.getDate(),
                req.getStartTime(),
                req.getEndTime(),
                req.getTopic());

        if (success) {
            return ResponseEntity.ok("Appointment booked successfully");
        } else {
            return ResponseEntity.badRequest().body("Failed to book appointment");
        }
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> getHistory(@RequestParam Long studentId) {
        List<Appointment> list = studentService.viewAppointmentHistory(studentId);
        return ResponseEntity.ok(list);
    }
   // =================== Cancelable Meetings ===================
    @GetMapping("/meetings/cancelable")
    public ResponseEntity<List<Meeting>> getCancelableMeetings(@RequestParam Long studentId) {
        List<Meeting> list = studentService.findCancellableMeetings(studentId);
        return ResponseEntity.ok(list);
    }


    // =================== Cancel Meeting ===================
    @PostMapping("/meetings/{id}/cancel")
    public ResponseEntity<String> cancel(@PathVariable Long id, @RequestBody CancelRequest req) {
        boolean success = studentService.cancelMeeting(id, req.getReason());

        if (success) {
            return ResponseEntity.ok("Meeting cancelled successfully");
        } else {
            return ResponseEntity.badRequest().body("Cannot cancel meeting");
        }
    }

    // =================== View Official Meetings ===================
    @GetMapping("/meetings/official")
    public ResponseEntity<List<Meeting>> getOfficial(@RequestParam Long studentId) {
        List<Meeting> list = studentService.viewOfficialMeetings(studentId);
        return ResponseEntity.ok(list);
    }

    // =================== View Tutor Available Slots ===================
    @GetMapping("/available-slots/{tutorId}")
    public ResponseEntity<List<FreeSlotResponse>> viewSlots(@PathVariable Long tutorId) {
        List<FreeSlotResponse> slots = studentService.viewTutorAvailableSlots(tutorId);
        return ResponseEntity.ok(slots);
    }

    // =================== View Meeting Detail ===================
    @GetMapping("/meeting/{id}")
    public ResponseEntity<Meeting> detail(@PathVariable Long id) {
        Meeting meeting = studentService.viewMeetingDetails(id);
        if (meeting != null) {
            return ResponseEntity.ok(meeting);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}