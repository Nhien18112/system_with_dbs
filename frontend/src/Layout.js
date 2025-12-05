﻿// src/Layout.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "./components/Footer";
import "./Layout.css";
import { Calendar, BookOpen, Settings, Bell } from "react-feather";

import logoImg from "./assets/logo-bk.png";
import avatarImg from "./assets/avatar.svg";
import { useAuth } from "./AuthContext";

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // <-- lấy từ AuthContext

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNoti, setShowNoti] = useState(false);

  const path = location.pathname;

  // Active sidebar
  const isMeetings = path.startsWith("/tutor/meetings");
  const isCourses = path.startsWith("/tutor/courses");
  const isProfile = path.startsWith("/tutor/profile");

  // Guard: chỉ cho tutor dùng layout này
  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    if (user.role !== "tutor") {
      navigate("/student");
    }
  }, [user, navigate]);

  // Trong lúc đang redirect thì không render gì
  if (!user || user.role !== "tutor") {
    return null;
  }

  const displayName = user.name || user.bkNetId || "Người dùng";

  const goHome = () => navigate("/tutor/home");

  const handleLogout = () => {
    logout();       // xoá user trong AuthContext
    navigate("/");  // quay lại trang landing
  };

  return (
    <div className="app-wrapper">
      {/* HEADER */}
      <header className="main-header">
        <div
          className="header-left"
          onClick={goHome}
          style={{ cursor: "pointer" }}
        >
          <img src={logoImg} alt="Logo" className="header-logo" />
          <h1 className="header-title">TUTOR SUPPORT SYSTEM</h1>
        </div>

        <div className="header-right">
          {/* Chuông thông báo */}
          <div className="bell-wrapper">
            <Bell
              size={24}
              className="icon-bell"
              color="white"
              onClick={() => setShowNoti(!showNoti)}
            />
            {showNoti && (
              <div className="notification-panel">
                <h4>Thông báo</h4>
                <ul>
                  <li>Không có thông báo</li>
                </ul>
              </div>
            )}
          </div>
          {/* User + menu */}
          <div className="user-info clickable" onClick={() => setShowUserMenu(!showUserMenu)}>
            <img src={avatarImg} alt="User" className="user-avatar" />
            <span>{displayName}</span>
          </div>

          {showUserMenu && (
            <div className="user-menu">
              <button className="user-menu-item" onClick={goHome}>
                Trang tổng quan
              </button>
              <button className="user-menu-item user-menu-item-danger" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          )}


        </div>
      </header>

      {/* BODY */}
      <div className="app-body">
        {/* SIDEBAR */}
        <aside className="main-sidebar">
          <div
            className={`nav-item ${isMeetings ? "active" : ""}`}
            onClick={() => navigate("/tutor/meetings")}
          >
            <Calendar size={30} />
            <span>Buổi gặp mặt</span>
          </div>
          <hr className="nav-divider" />

          <div
            className={`nav-item ${isCourses ? "active" : ""}`}
            onClick={() => navigate("/tutor/courses")}
          >
            <BookOpen size={30} />
            <span>Khóa học</span>
          </div>
          <hr className="nav-divider" />

          <div
            className={`nav-item ${isProfile ? "active" : ""}`}
            onClick={() => navigate("/tutor/profile")}
          >
            <Settings size={30} />
            <span>Hồ sơ cá nhân</span>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="page-content">{children}</main>
      </div>

      <Footer />
    </div>
  );
};

export default Layout;
