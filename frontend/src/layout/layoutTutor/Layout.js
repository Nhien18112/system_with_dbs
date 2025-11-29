﻿import React from "react";
import Footer from "../../components/Footer";
import "./Layout.css";
import { Calendar, BookOpen, Settings, Bell } from "react-feather";

// Import ảnh
import logoImg from '../../assets/logo-bk.png'; 
import avatarImg from '../../assets/avatar.svg';

const Layout = ({ children }) => {
  return (
    <div className="app-wrapper">
      {/* HEADER CHUẨN: Logo + Tên ----------- Chuông + User */}
      <header className="main-header">
        <div className="header-left">
          <img src={logoImg} alt="Logo" className="header-logo" />
          <h1 className="header-title">TUTOR SUPPORT SYSTEM</h1>
        </div>

        <div className="header-right">
          <Bell size={24} className="icon-bell" color="white" />

          <div className="user-info">
            <img src={avatarImg} alt="User" className="user-avatar" />
            <span>Trần Văn B</span>
          </div>
        </div>
      </header>

      <div className="app-body">
        {/* SIDEBAR (Bỏ logo ở đây đi vì đã lên Header rồi) */}
        <aside className="main-sidebar">
          <div className="nav-item">
            <Calendar size={30} />
            <span>Buổi gặp mặt</span>
          </div>
          <hr className="nav-divider" />

          <div className="nav-item">
            <BookOpen size={30} />
            <span>Khóa học</span>
          </div>
          <hr className="nav-divider" />

          <div className="nav-item active">
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
