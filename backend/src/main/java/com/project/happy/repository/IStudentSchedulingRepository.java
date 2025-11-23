package com.project.happy.repository;

import java.time.LocalDateTime;

public interface IStudentSchedulingRepository {
    boolean bookAppointment(Long studentId, Long tutorId,
                            LocalDateTime date, LocalDateTime startTime, String topic);
}