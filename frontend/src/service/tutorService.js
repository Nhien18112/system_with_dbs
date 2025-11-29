// src/service/tutorService.js
import apiClient from "./apiClient";

// GET all PENDING appointments for a tutor
export const getPendingAppointments = async (tutorId) => {
  const res = await apiClient.get(
    "/api/tutor/scheduling/appointments/pending",
    { params: { tutorId } }
  );
  return res.data;           // List<Appointment>
};

// POST approve
export const approveAppointment = async (appointmentId, tutorId) => {
  const res = await apiClient.post(
    `/api/tutor/scheduling/appointments/${appointmentId}/approve`,
    { tutorId }
  );
  return res.data;
};

// POST reject
export const rejectAppointment = async (appointmentId, tutorId, reason) => {
  const res = await apiClient.post(
    `/api/tutor/scheduling/appointments/${appointmentId}/reject`,
    { tutorId, reason }
  );
  return res.data;
};
