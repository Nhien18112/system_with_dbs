import "./App.css";
// import RegisterTutor from './RegisterTutor';
import LayoutTutor from "./layout/layoutTutor/Layout";
import TutorFreeSlot from "./TutorFreeSlot"; // Import component FreeSlot
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppointmentBooking from "./StudentAppointment/AppointmentBooking"; // Giả định import AppointmentBooking
import LayoutStudent from "./layout/layoutSv/LayoutSv";
import CourseStd from "./pages/feedback/CourseStd";
import FeedbackPage from "./pages/feedback/FeedbackPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========================================================= */}
        {/* 1. ROUTES CHUNG / TRANG CHỦ (STUDENT DEFAULT) */}
        {/* ========================================================= */}

        {/* Trang chủ: Mặc định hiển thị CourseStd cho Student */}
        <Route
          path="/"
          element={
            <LayoutStudent>
              <CourseStd />
            </LayoutStudent>
          }
        />

        {/* ========================================================= */}
        {/* 2. ROUTES DÀNH CHO STUDENT */}
        {/* ========================================================= */}

        {/* Trang danh sách khóa học của Student (CourseStd) */}
        <Route
          path="/course"
          element={
            <LayoutStudent>
              <CourseStd />
            </LayoutStudent>
          }
        />

        {/* Trang Feedback chi tiết (có tham số :id) */}
        <Route
          path="/course/feedback/:id"
          element={
            <LayoutStudent>
              <FeedbackPage />
            </LayoutStudent>
          }
        />

        {/* [ROUTE BỔ SUNG] Trang Đặt lịch hẹn (AppointmentBooking) */}
        <Route
          path="/booking"
          element={
            <LayoutStudent>
              <AppointmentBooking />
            </LayoutStudent>
          }
        />

        {/* [ROUTE BỔ SUNG] Trang đăng ký gia sư (RegisterTutor) - Nếu component này tồn tại */}
        {/* <Route
          path="/register-tutor"
          element={<RegisterTutor />}
        /> */}

        {/* ========================================================= */}
        {/* 3. ROUTES DÀNH CHO TUTOR */}
        {/* ========================================================= */}

        {/* [ROUTE BỔ SUNG] Trang quản lý Khung giờ trống (TutorFreeSlot) */}
        <Route
          path="/tutor/freeslot"
          element={
            <LayoutTutor>
              <TutorFreeSlot />
            </LayoutTutor>
          }
        />

        {/* [ROUTE BỔ SUNG] Trang Dashboard mặc định của Tutor */}
        <Route
          path="/tutor"
          element={
            <LayoutTutor>
              {/* Thay thế bằng component Dashboard thực tế của Tutor */}
              <div>Tutor Dashboard</div>
            </LayoutTutor>
          }
        />

        {/* Thêm các route Tutor khác như /tutor/profile, /tutor/appointments... ở đây */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
