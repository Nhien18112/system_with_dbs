package com.project.happy.repository;

import com.project.happy.entity.Appointment;
import com.project.happy.entity.Meeting;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Repository;

@Repository
public class MeetingRepository implements IMeetingRepository {

    private List<Meeting> meetings = new ArrayList<>();

    @Override
    public Meeting findById(int meetingId) {
        return meetings.stream()
                .filter(m -> m.getMeetingId().intValue() == meetingId)
                .findFirst()
                .orElse(null);
    }

    @Override
    public void save(Meeting meeting) {
        meetings.add(meeting);
    }

    @Override
    public void update(Meeting meeting) {
        // đơn giản: remove + add lại (hoặc thay thế theo ID)
        for (int i = 0; i < meetings.size(); i++) {
            if (meetings.get(i).getMeetingId().equals(meeting.getMeetingId())) {
                meetings.set(i, meeting);
                return;
            }
        }
    }

    // Tutor-specific queries
    @Override
    public List<Appointment> findPendingAppointmentsByTutor(int tutorId) {
        return meetings.stream()
                .filter(m -> m instanceof Appointment)
                .map(m -> (Appointment) m)
                .filter(a -> a.getTutorId() == tutorId && a.getAppointmentStatus() == Appointment.AppointmentStatus.PENDING)
                .collect(Collectors.toList());
    }

    @Override
    public List<Appointment> findApprovedAppointmentsByTutor(int tutorId) {
        return meetings.stream()
                .filter(m -> m instanceof Appointment)
                .map(m -> (Appointment) m)
                .filter(a -> a.getTutorId() == tutorId && a.getAppointmentStatus() == Appointment.AppointmentStatus.APPROVED)
                .collect(Collectors.toList());
    }

    // Student-specific queries
    @Override
    public List<Appointment> findAllAppointmentsByStudent(int studentId) {
        return meetings.stream()
                .filter(m -> m instanceof Appointment)
                .map(m -> (Appointment) m)
                .filter(a -> a.getStudentId() == studentId)
                .collect(Collectors.toList());
    }

    @Override
    public List<Appointment> findApprovedAppointmentsByStudent(int studentId) {
        return meetings.stream()
                .filter(m -> m instanceof Appointment)
                .map(m -> (Appointment) m)
                .filter(a -> a.getStudentId() == studentId && a.getAppointmentStatus() == Appointment.AppointmentStatus.APPROVED)
                .collect(Collectors.toList());
    }

    // Common / Helper
    @Override
    public List<Meeting> findCancellableMeetings(int userId) {
        return meetings.stream()
                .filter(m -> !m.isCancelled())
                .filter(m -> m.getTutorId() == userId || (m instanceof Appointment && ((Appointment) m).getStudentId() == userId))
                .collect(Collectors.toList());
    }
}
