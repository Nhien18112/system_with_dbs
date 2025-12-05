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

// --- Tutor registration APIs ---
export const registerTutor = async (studentId, subjectId, tutorId) => {
  // ensure numeric ids and match backend field names
  const body = { studentId: Number(studentId), subjectId: Number(subjectId), tutorId: Number(tutorId) };
  const res = await apiClient.post("/api/tutor-registration/register-tutor", body, {
    headers: { "X-User-Id": String(studentId) },
  });
  return res.data; // { registrationId, status }
};

export const cancelRegistration = async (registrationId, studentId) => {
  const body = { registrationId, studentId };
  const res = await apiClient.post("/api/tutor-registration/cancel-registration", body, {
    headers: { "X-User-Id": studentId },
  });
  return res.data;
};

export const suggestTutors = async (subject) => {
  const res = await apiClient.get("/api/tutor-registration/suggest", { params: { subject } });
  return res.data;
};

// --- Get registrations for tutor ---
export const getPendingRegistrations = async (tutorId) => {
  const res = await apiClient.get("/api/tutor-registration/pending-registrations", {
    params: { tutorId }
  });
  return res.data; // List<RegistrationDto>
};

export const getApprovedStudents = async (tutorId) => {
  const res = await apiClient.get("/api/tutor-registration/approved-students", {
    params: { tutorId }
  });
  return res.data; // List<RegistrationDto>
};

export const approveRegistration = async (registrationId, tutorId) => {
  const res = await apiClient.post(`/api/tutor-registration/${registrationId}/approve`, { tutorId });
  return res.data;
};

export const rejectRegistration = async (registrationId, tutorId, reason) => {
  const res = await apiClient.post(`/api/tutor-registration/${registrationId}/reject`, { tutorId, reason });
  return res.data;
};

// Check if student has any approved registration
export const getStudentApprovedRegistrations = async (studentId) => {
  // Backend exposes an endpoint to get the approved tutor for a student at
  // GET /api/tutor-registration/student/{studentId}/my-tutor which returns 200 or 404.
  try {
    const res = await apiClient.get(`/api/tutor-registration/student/${studentId}/my-tutor`);
    return [res.data];
  } catch (err) {
    if (err.response && err.response.status === 404) return [];
    throw err;
  }
};