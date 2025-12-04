package com.project.happy.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.happy.entity.Appointment;
// import com.project.happy.entity.Meeting; // Không dùng Meeting trong repo này nữa

@Repository
// 💡 SỬA: Đổi tên thành IAppointmentRepository và dùng <Appointment, Long>
public interface IAppointmentRepository extends JpaRepository<Appointment, Long> {

    // --- TUTOR Queries ---

    // 1. Tìm các cuộc hẹn đang chờ duyệt của Tutor
    @Query("SELECT a FROM Appointment a WHERE a.tutorId = :tutorId AND a.appointmentStatus = 'PENDING'")
    List<Appointment> findPendingAppointmentsByTutor(@Param("tutorId") Long tutorId);

    // 2. Tìm tất cả cuộc hẹn chính thức của Tutor (Đã duyệt và chưa hủy)
    // 💡 SỬA: Query trên Appointment, trả về List<Appointment>
    @Query("SELECT a FROM Appointment a WHERE a.tutorId = :tutorId AND a.cancelled = false AND a.appointmentStatus = 'APPROVED'")
    List<Appointment> findOfficialAppointmentsByTutor(@Param("tutorId") Long tutorId);

    // 3. (Nếu cần tách biệt, hàm trên đã bao gồm logic này rồi)
    @Query("SELECT a FROM Appointment a WHERE a.tutorId = :tutorId AND a.appointmentStatus = 'APPROVED'")
    List<Appointment> findApprovedAppointmentsByTutor(@Param("tutorId") Long tutorId);


    // --- STUDENT Queries ---
    
    // 4. Tìm tất cả cuộc hẹn chính thức của Student (Đã duyệt, chưa hủy)
    @Query("SELECT a FROM Appointment a WHERE a.studentId = :studentId AND a.cancelled = false AND a.appointmentStatus = 'APPROVED'")
    List<Appointment> findOfficialAppointmentsByStudent(@Param("studentId") Long studentId);

    // 5. Tìm lịch sử cuộc hẹn của sinh viên (Bất kể trạng thái)
    @Query("SELECT a FROM Appointment a WHERE a.studentId = :studentId")
    List<Appointment> findAllAppointmentsByStudent(@Param("studentId") Long studentId);
}