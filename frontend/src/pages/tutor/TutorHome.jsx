// src/pages/tutor/TutorHome.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";   // chỉnh đường dẫn cho đúng
import "./TutorHome.css";

const TutorHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();   // { name, role, ... } set trong SSO callback

  useEffect(() => {
    // chưa login -> về trang chủ
    if (!user) {
      navigate("/");
      return;
    }

    // login nhưng không phải tutor -> sang student
    if (user.role !== "tutor") {
      navigate("/student");
    }
  }, [user, navigate]);

  // tránh nháy màn hình khi đang redirect
  if (!user || user.role !== "tutor") return null;

  return (
    <div className="tutor-home-wrapper">
      <div className="tutor-home-hero">
        <div className="tutor-hero-text">
          <p className="tutor-hero-subtitle">Welcome back,</p>
          <h1 className="tutor-hero-title">{user.name}!</h1>

          <button className="tutor-hero-button">
            Xem lịch dạy
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorHome;
