import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const SsoCallbackPage = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(search);
    const ticket = params.get("ticket");
    const bkNetId = params.get("bkNetId");

    if (!ticket || !bkNetId) {
      setError("Thiếu ticket hoặc bkNetId");
      return;
    }

    const serviceUrl = window.location.origin + "/sso/callback";

    const validate = async () => {
      try {
        const res = await fetch(
          `http://localhost:9002/api/sso/service-validate?ticket=${encodeURIComponent(
            ticket
          )}&service=${encodeURIComponent(serviceUrl)}&bkNetId=${encodeURIComponent(
            bkNetId
          )}`
        );

        if (!res.ok) {
          const txt = await res.text();
          setError(txt || "Ticket không hợp lệ");
          return;
        }

        const data = await res.json();

        // Lưu thông tin vào AuthContext
        login({
          name: data.fullName,
          role: data.role === "TUTOR" ? "tutor" : "student",
          bkNetId: data.bkNetId,
          email: data.email,
        });

        if (data.role === "TUTOR") {
          navigate("/tutor/home");
        } else {
          navigate("/student");
        }
      } catch (err) {
        setError("Không kết nối được SSO server");
      }
    };

    validate();
  }, [search, login, navigate]);

  if (error) return <p>{error}</p>;
  return <p>Đang xác thực SSO, vui lòng chờ...</p>;
};

export default SsoCallbackPage;
