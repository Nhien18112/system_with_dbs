// src/services/studentService.js
import apiClient from "./apiClient";

/**
 * Lấy lịch rảnh
 */
export const getTutorFreeSlots = async (tutorId) => {
  const res = await apiClient.get(
    `/api/student/scheduling/available-slots/${tutorId}`
  );
  console.log("Slots from backend:", res.data);
  return res.data;
};

/**
 * Đặt lịch hẹn
 *  - dateKey: "YYYY-MM-DD"
 *  - timeRange: "HH:mm - HH:mm"
 */
export const bookAppointment = async ({
  studentId,
  tutorId,
  dateKey,
  timeRange,
  topic,
}) => {
  const [startLabel, endLabel] = timeRange.split(" - "); // "07:00", "09:00"

  const payload = {
    studentId,
    tutorId,
    date: `${dateKey}T00:00:00`,
    startTime: `${dateKey}T${startLabel}:00`,
    endTime: `${dateKey}T${endLabel}:00`,
    topic,
  };

  console.log("Booking payload:", payload);

  const res = await apiClient.post(
    "/api/student/scheduling/appointments",
    payload
  );
  return res.data;
};

// Lấy danh sách appointment của student
export const getStudentAppointments = async (studentId) => {
  const res = await apiClient.get("/api/student/scheduling/appointments", {
    params: { studentId },
  });
  console.log("Appointments from backend:", res.data);
  return res.data; // List<Appointment>
};

// Hủy appointment (dùng meetingId của Appointment)
export const cancelAppointment = async (
  meetingId,
  reason = "Student cancelled appointment"
) => {
  const res = await apiClient.post(
    `/api/student/scheduling/meetings/${meetingId}/cancel`,
    { reason } // CancelRequest chỉ có reason
  );
  return res.data; // String message
};

// --- BỔ SUNG MỚI ---

// 1. Lấy danh sách Meeting chính thức (Official - bao gồm cả Appointment và Consultation)
export const getOfficialMeetings = async (studentId) => {
  const res = await apiClient.get("/api/student/scheduling/meetings/official", {
    params: { studentId },
  });
  // Backend trả về List<Meeting>
  return res.data;
};

export const getCancelableMeetings = async (studentId) => {
  const res = await apiClient.get("/api/student/scheduling/meetings/cancelable", {
    params: { studentId },
  });
  return res.data;
};

// Hủy Meeting
export const cancelMeeting = async (meetingId, reason) => {
  const res = await apiClient.post(
    `/api/student/scheduling/meetings/${meetingId}/cancel`,
    { reason }
  );
  return res.data;
};

export const getMyTutor = async (studentId) => {
  const res = await apiClient.get(
    `/api/tutor-registration/student/${studentId}/my-tutor`
  );
  return res.data; 
};