// src/pages/SsoLoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./SsoLoginPage.css";
import logo from "../assets/logo-bk.png";

const SsoLoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();

    // ---- logic demo: route theo tài khoản ----
    // bạn giữ nguyên logic cũ của bạn nếu đã có
    if (username.startsWith("b.")) {
      // tutor (demo) - set id to match sample DB (see dbs_Mysql.sql)
      login({ id: 13, username: "b.tranvan", fullName: "Trần Văn B", role: "tutor" });
      navigate("/tutor/home");
    } else if (username.startsWith("a.")) {
      // student (demo) - set id to match sample DB (a.nguyenvan -> id 5)
      login({ id: 5, username: "a.nguyenvan", fullName: "Nguyễn Văn A", role: "student" });
      navigate("/student");
    } else {
      alert("Tài khoản demo: b.tranvan / a.nguyenvan");
    }
  };

  return (
    <div className="sso-page">
      {/* Thanh tím trên cùng */}
<header className="sso-topbar">
  <div className="sso-topbar-inner">
    <div className="sso-topbar-logo">
      <img src={logo} alt="BK Logo" className="sso-logo" />
    </div>
    <h1 className="sso-topbar-title">DỊCH VỤ XÁC THỰC TẬP TRUNG</h1>
  </div>
</header>

      {/* Nội dung chính */}
      <main className="sso-main">
        <div className="sso-card">
          {/* Cột trái: form */}
          <div className="sso-left">
            <h2 className="sso-left-title">Nhập thông tin tài khoản của bạn</h2>

            <form onSubmit={handleSubmit} className="sso-form">
              <div className="sso-form-group">
                <label htmlFor="username">Tên tài khoản</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="sso-input"
                />
              </div>

              <div className="sso-form-group">
                <label htmlFor="password">Mật khẩu</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="sso-input"
                />
              </div>

              <div className="sso-form-remember">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <label htmlFor="remember">
                  Cảnh báo trước khi tôi đăng nhập vào các trang web khác.
                </label>
              </div>

              <div className="sso-form-actions">
                <button type="submit" className="sso-btn sso-btn-primary">
                  Đăng nhập
                </button>
                <button
                  type="button"
                  className="sso-btn sso-btn-secondary"
                  onClick={() => {
                    setUsername("");
                    setPassword("");
                  }}
                >
                  Xóa
                </button>
              </div>

              <a href="#/" className="sso-change-password">
                Thay đổi mật khẩu?
              </a>
            </form>
          </div>

          {/* Cột phải: Lưu ý + Hỗ trợ kỹ thuật */}
          <div className="sso-right">
            <div className="sso-lang">
              Ngôn ngữ: <a href="#/">Tiếng Việt</a> | <a href="#/">Tiếng Anh</a>
            </div>

            <h3 className="sso-right-title">Lưu ý</h3>
            <p className="sso-right-text">
              Trang đăng nhập này cho phép đăng nhập một lần đến nhiều hệ thống
              web ở Trường Đại học Bách khoa – ĐHQG HCM. Được hiểu là bạn chỉ
              cần đăng nhập một lần cho những hệ thống web đã đăng ký với hệ
              thống xác thực này.
            </p>
            <p className="sso-right-text">
              Bạn cần dùng tài khoản HCMUT để đăng nhập. Tài khoản HCMUT cho
              phép truy cập đến nhiều tài nguyên bao gồm hệ thống tin, thông
              tin, thư điện tử, ...
            </p>
            <p className="sso-right-text">
              Vì lý do an ninh, khi dùng xong bạn hãy thoát khỏi trình duyệt web
              sau khi kết thúc việc truy cập các dịch vụ đòi hỏi xác thực.
            </p>

            <h3 className="sso-right-title">Hỗ trợ kỹ thuật</h3>
            <p className="sso-right-text">
              E-mail:{" "}
              <a href="mailto:support@hcmut.edu.vn">
                support@hcmut.edu.vn
              </a>{" "}
              | ĐT: (84-8) 38647256 – 7204
            </p>
          </div>
        </div>

        {/* Footer nhỏ giống bản gốc */}
        <footer className="sso-footer">
          Bản quyền © 2011 – 2012 Trường Đại học Bách khoa – ĐHQG-HCM. Được hỗ
          trợ bởi <a href="#/">Jasig CAS 3.5.1</a>
        </footer>
      </main>
    </div>
  );
};

export default SsoLoginPage;
