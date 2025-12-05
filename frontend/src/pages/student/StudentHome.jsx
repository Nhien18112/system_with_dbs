// src/pages/student/StudentHome.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import "./StudentHome.css";

const StudentHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    if (user.role !== "student") {
      navigate("/tutor/home");
    }
  }, [user, navigate]);

  if (!user || user.role !== "student") return null;

  const handleRegisterTutor = () => {
    navigate("/student/register-tutor");
  };

  return (
    <div className="student-home-wrapper">
      <div className="student-home-hero">
        <div className="hero-text">
          <p className="hero-subtitle">Welcome back,</p>
          <h1 className="hero-title">{user.name}!</h1>

          <button className="hero-button" onClick={handleRegisterTutor}>
            Đăng kí tutor
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
