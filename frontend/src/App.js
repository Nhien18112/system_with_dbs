// src/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import SsoLoginPage from "./pages/SsoLoginPage";
import SsoForgotPage from "./pages/SsoForgotPage";
import RegisterTutor from "./pages/student/RegisterTutor";


import Layout from "./Layout";                 // tutor layout
import TutorHome from "./pages/tutor/TutorHome";
import TutorMeetings from "./pages/tutor/TutorMeetings";
import TutorCourses from "./pages/tutor/TutorCourses";
import TutorProfile from "./pages/tutor/TutorProfile";
import TutorFreeSlot from "./TutorFreeSlot";
import TutorHandleRequest from "./TutorHandleRequest/TutorHandleRequest";


// ==== STUDENT IMPORTS ====
import StudentLayout from "./pages/student/StudentLayout";
import StudentHome from "./pages/student/StudentHome";
import StudentMeetings from "./pages/student/StudentMeetings";
import StudentCourses from "./pages/student/StudentCourses";
import StudentProfile from "./pages/student/StudentProfile";
import StudentAppointment from "./StudentAppointment/StudentAppointment";
import FeedbackPage from "./pages/feedback/FeedbackPage";

function App() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<HomePage />} />

      {/* SSO */}
      <Route path="/login" element={<SsoLoginPage />} />
      <Route path="/sso/forgot" element={<SsoForgotPage />} />

      {/* ==== STUDENT (dùng StudentLayout + Outlet) ==== */}
      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<StudentHome />} />
        <Route path="meetings" element={<StudentAppointment />} />
        <Route path="courses" element={<StudentCourses />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="register-tutor" element={<RegisterTutor />} />
      </Route>

      {/* ==== TUTOR (dùng Layout bọc children) ==== */}
      <Route
        path="/tutor/home"
        element={
          <Layout>
            <TutorHome />
          </Layout>
        }
      />
      <Route
        path="/tutor/meetings"
        element={
          <Layout>
            <TutorMeetings />
          </Layout>
        }
      />
      <Route
        path="/tutor/courses"
        element={
          <Layout>
            <TutorCourses />
          </Layout>
        }
      />
       <Route
        path="/tutor/handle"
        element={
          <Layout>
            <TutorHandleRequest/>
          </Layout>
        }
      />

      <Route
        path="/tutor/profile"
        element={
          <Layout>
            <TutorProfile />
          </Layout>
        }
      />
      <Route
        path="/tutor/free-slots"
        element={
          <Layout>
            <TutorFreeSlot />
          </Layout>
        }
      />
      <Route path="/tutor" element={<Navigate to="/tutor/home" />} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
