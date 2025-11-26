// src/services/studentService.js
import apiClient from "./apiClient";

/**
 * Gọi backend để lấy danh sách khung giờ rảnh của 1 tutor trong 1 ngày.
 * tutorId: Long
 * date: string "YYYY-MM-DD"
 *
 * Giả định backend trả về:
 * [
 *   { "id": 1, "startTime": "08:00", "endTime": "09:00" },
 *   ...
 * ]
 */
export const getTutorAvailableSlots = (tutorId, date) => {
  if (!tutorId || !date) {
    return Promise.resolve([]);
  }

  return apiClient
    .get(`/scheduling/tutors/${tutorId}/available-slots`, {
      params: { date }, // ?date=2025-11-30
    })
    .then((res) => res.data);
};

/**
 * Đặt lịch hẹn mới (student -> tutor).
 * Payload map 1-1 với AppointmentRequest ở backend:
 *
 *  AppointmentRequest {
 *    Long studentId;
 *    Long tutorId;
 *    String date;      // "YYYY-MM-DD"
 *    String startTime; // "HH:mm"
 *    String topic;
 *    String message;   // (nếu DTO của bạn có field message)
 *  }
 */
export const bookAppointment = ({
  studentId,
  tutorId,
  date,
  startTime,
  topic,
  message,
}) => {
  const requestBody = {
    studentId,
    tutorId,
    date,
    startTime,
    topic,
    message,
  };

  return apiClient
    .post("/scheduling/appointments", requestBody)
    .then((res) => res.data); // res.data là Appointment (Meeting) backend trả về
};
