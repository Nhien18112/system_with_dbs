import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import Footer from "../components/Footer";
import logo from "../assets/logo-bk.png";
import heroImage from "../assets/illus.png";

const HomePage = () => {
  const navigate = useNavigate();

// Trong HomePage.js
const handleLoginClick = () => {
  const service = encodeURIComponent(window.location.origin + "/sso/callback");
  window.location.href = `http://localhost:5173/login?service=${service}`;
};


  return (
    <div className="landing-page">
      <div className="landing-top">
        <header className="landing-header">
          <img src={logo} alt="BK Logo" className="landing-logo" />
          <div className="landing-logo-text">
            <p className="logo-line1">ĐẠI HỌC QUỐC GIA THÀNH PHỐ HỒ CHÍ MINH</p>
            <p className="logo-line2">TRƯỜNG ĐẠI HỌC BÁCH KHOA</p>
          </div>
        </header>

        <main className="landing-main">
          <section className="landing-left">
            <p className="landing-welcome">WELCOME TO</p>
            <h1 className="landing-title">TUTOR SUPPORT SYSTEM</h1>
            <p className="landing-description">
              Hệ thống hỗ trợ dạy kèm trực tuyến dành cho sinh viên Trường Đại học Bách
              Khoa TP.HCM. Kết nối học sinh với những người dạy có kinh nghiệm để
              nâng cao chất lượng học tập.
            </p>
            <button className="landing-button" onClick={handleLoginClick}>
              Đăng nhập
            </button>
          </section>

          <section className="landing-right">
            <img
              src={heroImage}
              alt="Sinh viên đang học"
              className="landing-hero-image"
            />
          </section>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
