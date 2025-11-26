package com.project.happy.repository;

import com.project.happy.entity.Appointment;
import com.project.happy.entity.AppointmentStatus;
import com.project.happy.entity.MeetingStatus;
import com.project.happy.entity.Meeting;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Repository;

@Repository
public class MeetingRepository implements IMeetingRepository {

    private List<Meeting> meetings = new ArrayList<>();

    @Override
    public Meeting findById(Long meetingId) {
        return meetings.stream()
                .filter(m -> m.getMeetingId() != null && m.getMeetingId().equals(meetingId))
                .findFirst()
                .orElse(null);
    }

    @Override
    public void save(Meeting meeting) {
        meetings.add(meeting);
    }

    @Override
    public void update(Meeting meeting) {
        for (int i = 0; i < meetings.size(); i++) {
            Meeting m = meetings.get(i);
            if (m.getMeetingId() != null && m.getMeetingId().equals(meeting.getMeetingId())) {
                meetings.set(i, meeting);
                return;
            }
        }
        // Nếu không tìm thấy → ném exception
        throw new IllegalArgumentException("Meeting with ID " + meeting.getMeetingId() + " not found");
    }

    // =====================
    // Tutor-specific queries
    // =====================
    @Override
    public List<Appointment> findPendingAppointmentsByTutor(Long tutorId) {
        return meetings.stream()
                .filter(m -> m instanceof Appointment)
                .map(m -> (Appointment) m)
                .filter(a -> a.getTutorId().equals(tutorId) && a.getAppointmentStatus() == AppointmentStatus.PENDING)
                .collect(Collectors.toList());
    }

    @Override
    public List<Appointment> findApprovedAppointmentsByTutor(Long tutorId) {
        return meetings.stream()
                .filter(m -> m instanceof Appointment)
                .map(m -> (Appointment) m)
                .filter(a -> a.getTutorId().equals(tutorId) && a.getAppointmentStatus() == AppointmentStatus.APPROVED)
                .collect(Collectors.toList());
    }

    @Override
    public List<Appointment> findOfficialAppointmentsByTutor(Long tutorId) {
        // Tận dụng hàm findApprovedAppointmentsByTutor
        return findApprovedAppointmentsByTutor(tutorId).stream()
                .filter(a -> !a.isCancelled()) // chỉ lấy những buổi chưa hủy
                .collect(Collectors.toList());
    }

    // =====================
    // Student-specific queries
    // =====================
    @Override
    public List<Appointment> findAllAppointmentsByStudent(Long studentId) {
        return meetings.stream()
                .filter(m -> m instanceof Appointment)
                .map(m -> (Appointment) m)
                .filter(a -> a.getStudentId().equals(studentId))
                .collect(Collectors.toList());
    }

    @Override
    public List<Appointment> findApprovedAppointmentsByStudent(Long studentId) {
        return meetings.stream()
                .filter(m -> m instanceof Appointment)
                .map(m -> (Appointment) m)
                .filter(a -> a.getStudentId().equals(studentId)
                        && a.getAppointmentStatus() == AppointmentStatus.APPROVED)
                .collect(Collectors.toList());
    }

    @Override
    public List<Appointment> findOfficialAppointmentsByStudent(Long studentId) {
        return findApprovedAppointmentsByStudent(studentId).stream()
                .filter(a -> !a.isCancelled()) // chỉ lấy buổi chưa hủy
                .collect(Collectors.toList());
    }

    // =====================
    // Cancellable meetings (tách Tutor / Student)
    // =====================
    @Override
    public List<Appointment> findCancellableAppointmentsByTutor(Long tutorId) {
        return findOfficialAppointmentsByTutor(tutorId).stream() // tận dụng hàm official
                .filter(a -> a.getStatus() == MeetingStatus.SCHEDULED) // chỉ lấy Scheduled
                .collect(Collectors.toList());
    }

    @Override
    public List<Appointment> findCancellableAppointmentsByStudent(Long studentId) {
        return findOfficialAppointmentsByStudent(studentId).stream() // tận dụng hàm official
                .filter(a -> a.getStatus() == com.project.happy.entity.MeetingStatus.SCHEDULED) // chỉ Scheduled
                .collect(Collectors.toList());
    }

}