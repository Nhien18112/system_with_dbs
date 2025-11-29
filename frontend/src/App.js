import "./App.css";
// import RegisterTutor from './RegisterTutor'; // Cái nào không dùng thì comment
import LayoutTutor from "./layout/layoutTutor/Layout"; // <--- QUAN TRỌNG: Bỏ comment dòng này
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import AppointmentBooking from './AppointmentBooking';
import LayoutStudent from "./layout/layoutSv/LayoutSv";
import CourseStd from "./pages/feedback/CourseStd";
import FeedbackPage from "./pages/feedback/FeedbackPage";
function App() {
  return (
    // <LayoutTutor>
    //   <TutorFreeSlot />
    // </LayoutTutor>
    // <LayoutStudent>
    //   <CourseStd></CourseStd>
    // </LayoutStudent>
    <BrowserRouter>
      <Routes>
        <Route
          path="/course"
          element={
            <LayoutStudent>
              <CourseStd />
            </LayoutStudent>
          }
        />

        <Route
          path="/course/feedback/:id"
          element={
            <LayoutStudent>
              <FeedbackPage />
            </LayoutStudent>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
