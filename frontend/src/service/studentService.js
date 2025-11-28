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
