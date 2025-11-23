package com.project.happy.repository;

import com.project.happy.entity.Appointment;
import com.project.happy.entity.Meeting;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class StudentSchedulingRepository implements IStudentSchedulingRepository {

    private List<Meeting> meetings = new ArrayList<>();

    @Override
    public boolean bookAppointment(Long studentId, Long tutorId,
                                   LocalDateTime date, LocalDateTime startTime, String topic) {
        LocalDateTime endTime = startTime.plusHours(1);
        Appointment newAppointment = new Appointment(System.currentTimeMillis(), tutorId, studentId,
                date, startTime, endTime, topic);

        for (Meeting m : meetings) {
            if (m.getTutorId().equals(tutorId) && m.overlapsWith(newAppointment)) {
                return false; // conflict
            }
        }

        meetings.add(newAppointment);
        return true;
    }

    public List<Meeting> viewMeetings(Long userId) {
        List<Meeting> result = new ArrayList<>();
        for (Meeting m : meetings) {
            if (m instanceof Appointment) {
                Appointment a = (Appointment) m;
                if (a.getStudentId().equals(userId)) result.add(a);
            }
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
