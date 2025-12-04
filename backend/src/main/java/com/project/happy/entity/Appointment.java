package com.project.happy.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(name = "appointments")
public class Appointment extends Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appointment_id")
    private Long appointmentId;

    @Column(name = "student_id")
    private Long studentId;

    // Trạng thái riêng của Appointment (PENDING/APPROVED/REJECTED)
    @Enumerated(EnumType.STRING)
    @Column(name = "appointment_status")
    private AppointmentStatus appointmentStatus;

    @Column(name = "reject_reason")
    private String rejectReason;

    // Giữ lại cột này để tham chiếu nếu cần (nhưng không dùng để lấy giờ nữa)
    @Column(name = "availability_id")
    private Integer availabilityId;

    public Appointment() { super(); }

    public Appointment(Long tutorId, Long studentId, LocalDateTime startTime, LocalDateTime endTime, String topic) {
        // Truyền tham số lên lớp cha để lưu vào các cột start_time, end_time vừa tạo
        super(tutorId, startTime, endTime, topic, MeetingType.APPOINTMENT);
        
        this.studentId = studentId;
        this.appointmentStatus = AppointmentStatus.PENDING;
    }

    // --- Logic Approve / Reject ---
    public boolean approve() {
        if (appointmentStatus != AppointmentStatus.PENDING) return false;
        appointmentStatus = AppointmentStatus.APPROVED;
        return true;
    }

    public boolean reject(String reason) {
        if (appointmentStatus != AppointmentStatus.PENDING) return false;
        appointmentStatus = AppointmentStatus.REJECTED;
        this.rejectReason = reason;
        return true;
    }

    // --- Getters & Setters ---
    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }
    
    // Override để tương thích code cũ
    public Long getMeetingId() { return appointmentId; } 

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public AppointmentStatus getAppointmentStatus() { return appointmentStatus; }
    public void setAppointmentStatus(AppointmentStatus appointmentStatus) { this.appointmentStatus = appointmentStatus; }
    public String getRejectReason() { return rejectReason; }
    public void setRejectReason(String rejectReason) { this.rejectReason = rejectReason; }
    public Integer getAvailabilityId() { return availabilityId; }
    public void setAvailabilityId(Integer availabilityId) { this.availabilityId = availabilityId; }
}