// src/pages/student/StudentLayout.jsx
import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Calendar, BookOpen, Settings, Bell } from "react-feather";
import { useAuth } from "../../AuthContext";
import Footer from "../../components/Footer";
import "../../Layout.css"; // dùng lại layout giống tutor
import logoImg from "../../assets/logo-bk.png";
import avatarImg from "../../assets/avatar.svg";


const StudentLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const goHome = () => navigate("/student");
  const logout = () => navigate("/");

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="app-wrapper">
      {/* HEADER */}
      <header className="main-header">
        <div className="header-left" onClick={goHome} style={{ cursor: "pointer" }}>
          <img src={logoImg} alt="Logo" className="header-logo" />
          <h1 className="header-title">TUTOR SUPPORT SYSTEM</h1>
        </div>

        <div className="header-right">
          {/* Chuông notif */}
          <div className="notification-wrapper">
            <Bell size={24} className="icon-bell" color="white" />
          </div>

          {/* Avatar + Tên + Menu dropdown */}
          <div
            className="user-info"
            onClick={() => setMenuOpen((o) => !o)}
            style={{ cursor: "pointer" }}
          >
            <img src={avatarImg} alt="User" className="user-avatar" />
            <span>{user?.name || "Người dùng"}</span>

            {menuOpen && (
              <div className="user-menu">
                <button className="user-menu-item" onClick={goHome}>
                  Trang tổng quan
                </button>
                <button className="user-menu-item logout" onClick={logout}>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* BODY: sidebar + content */}
      <div className="app-body">
        <aside className="main-sidebar">
          <div
            className={`nav-item ${isActive("/student/meetings") ? "active" : ""}`}
            onClick={() => navigate("/student/meetings")}
          >
            <Calendar size={26} />
            <span>Buổi gặp mặt</span>
          </div>
          <hr className="nav-divider" />

          <div
            className={`nav-item ${isActive("/student/courses") ? "active" : ""}`}
            onClick={() => navigate("/student/courses")}
          >
            <BookOpen size={26} />
            <span>Khóa học</span>
          </div>
          <hr className="nav-divider" />

          <div
            className={`nav-item ${isActive("/student/profile") ? "active" : ""}`}
            onClick={() => navigate("/student/profile")}
          >
            <Settings size={26} />
            <span>Hồ sơ cá nhân</span>
          </div>
        </aside>

        <main className="page-content">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default StudentLayout;
