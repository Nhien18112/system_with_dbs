package com.project.happy.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Repository;

import com.project.happy.entity.Appointment;
import com.project.happy.entity.AppointmentStatus;
import com.project.happy.entity.Meeting;


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
    public List<Meeting> findApprovedMeetingByStudent(Long studentId) {
        return meetings.stream()
                .filter(m -> m instanceof Appointment)
                .map(m -> (Appointment) m)
                .filter(a -> a.getStudentId().equals(studentId)
                        && a.getAppointmentStatus() == AppointmentStatus.APPROVED)
                .collect(Collectors.toList());
    }

    @Override
    public List<Meeting> findApprovedMeetingByTutor(Long tutorId) {
        return meetings.stream()
                .filter(m -> m instanceof Appointment)
                .map(m -> (Appointment) m)
                .filter(a -> a.getTutorId().equals(tutorId)
                        && a.getAppointmentStatus() == AppointmentStatus.APPROVED)
                .collect(Collectors.toList());
    }

    

    // =====================
    // Cancellable meetings (tách Tutor / Student)
    // =====================

    

    @Override
    public List<Meeting> findOfficialMeetingsByStudent(Long studentId) {
        return findApprovedMeetingByStudent(studentId).stream()
                .filter(m -> m instanceof Appointment)
                .map(m -> (Appointment) m)
                .filter(a -> a.getStudentId().equals(studentId) && !a.isCancelled())
                .collect(Collectors.toList());
    }

    // Lấy mọi meeting đã approved (chưa hủy) cho tutor
    public List<Meeting> findOfficialMeetingsByTutor(Long tutorId) {
        return findApprovedMeetingByTutor(tutorId).stream()
                .filter(m -> m instanceof Appointment)
                .map(m -> (Appointment) m)
                .filter(a -> a.getStudentId().equals(tutorId) && !a.isCancelled())
                .collect(Collectors.toList());
    }

    // Meetings cancellable cho student
    

}