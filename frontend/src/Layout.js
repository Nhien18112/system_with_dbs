import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">🎓 HCMUT</div>
            <span className="header-title">Tutor Support System</span>
          </div>
          <div className="header-right">
            <span className="user-name">Nguyễn Văn A</span>
            <div className="user-avatar">NA</div>
          </div>
        </div>
      </header>

      <div className="main-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="nav-menu">
            <div className="nav-item active">
              <span className="nav-icon">🏠</span>
              <span>Trang chủ</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon">📝</span>
              <span>Buổi giáo dạy</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon">📚</span>
              <span>Khóa học</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon">👨‍🏫</span>
              <span>Tutor</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon">⭐</span>
              <span>Hỗ trợ cá nhân</span>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
}
