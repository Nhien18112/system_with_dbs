import React from "react";
import { useNavigate } from "react-router-dom";

const SsoForgotPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 40 }}>
      <h2>Thay đổi mật khẩu (demo)</h2>
      <p>Trang này chỉ minh họa, không gọi API thật.</p>
      <button onClick={() => navigate("/login")}>
        Quay lại trang đăng nhập
      </button>
    </div>
  );
};

export default SsoForgotPage;
