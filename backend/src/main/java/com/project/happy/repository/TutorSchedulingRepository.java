package com.project.happy.repository;

import com.project.happy.entity.Appointment;
import com.project.happy.entity.Meeting;

import java.util.ArrayList;
import java.util.List;

public class TutorSchedulingRepository implements ITutorSchedulingRepository {

    private List<Meeting> meetings = new ArrayList<>();

    @Override
    public boolean approveAppointment(Long appointmentId, Long tutorId) {
        for (Meeting m : meetings) {
            if (m instanceof Appointment) {
                Appointment a = (Appointment) m;
                if (a.getMeetingId().equals(appointmentId)) return a.approve(tutorId);
            }
        }
        return false;
    }

    @Override
    public boolean rejectAppointment(Long appointmentId, Long tutorId) {
        for (Meeting m : meetings) {
            if (m instanceof Appointment) {
                Appointment a = (Appointment) m;
                if (a.getMeetingId().equals(appointmentId)) return a.reject(tutorId);
            }
        }
        return false;
    }

    public List<Meeting> viewMeetings(Long userId) {
        List<Meeting> result = new ArrayList<>();
        for (Meeting m : meetings) {
            if (m.getTutorId().equals(userId)) result.add(m);
        }
        return result;
    }

    public boolean cancelMeeting(Long meetingId, Long userId, String reason) {
        for (Meeting m : meetings) {
            if (m.getMeetingId().equals(meetingId)) return m.cancel(userId, reason);
        }
        return false;
    }
}
