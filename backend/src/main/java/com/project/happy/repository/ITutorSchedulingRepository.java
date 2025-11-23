package com.project.happy.repository;

public interface ITutorSchedulingRepository extends ISchedulingRepository {
    boolean approveAppointment(Long appointmentId, Long tutorId);
    boolean rejectAppointment(Long appointmentId, Long tutorId);
}