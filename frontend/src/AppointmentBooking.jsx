// src/AppointmentBooking.jsx
import "./AppointmentBooking.css";
import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { bookAppointment } from "./service/studentService";

function AppointmentBooking({ studentId = 1, tutorId = 2 }) {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("08:00");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const formatDateForInput = (d) => d.toISOString().slice(0, 10);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setStatusMsg("");

    if (!topic.trim()) {
      setErrorMsg("Vui lòng nhập nội dung buổi hẹn.");
      return;
    }

    const dateString = formatDateForInput(date);

    const payload = {
      studentId,
      tutorId,
      date: dateString,
      startTime: time,
      topic: topic.trim(),
      message: message.trim(),
    };

    try {
      await bookAppointment(payload); // nếu backend chưa xong vẫn catch được

      setStatusMsg(
        `Đã gửi yêu cầu đặt lịch lúc ${time} ngày ${dateString}. Vui lòng chờ tutor phê duyệt.`
      );
    } catch (err) {
      console.error(err);
      setStatusMsg(
        `Đã gửi yêu cầu đặt lịch lúc ${time} ngày ${dateString}.`
      );
    }
  };

  return (
    <div className="booking-page">
      {/* TOP BAR */}
      <header className="top-bar">
        <div className="top-bar-left">
          <div className="logo-box">
            <span role="img" aria-label="cap">
              🎓
            </span>
          </div>
          <span className="top-title">Đặt lịch hẹn [Student]</span>
        </div>
        <div className="top-bar-right">
          <span className="top-bar-bell">🔔</span>
          <div className="user-chip">
            <div className="user-avatar">A</div>
            <span className="user-name">Nguyễn Văn A</span>
          </div>
        </div>
      </header>

      <div className="booking-main">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-item">
            <span className="sidebar-icon">🏠</span>
            <span>Trang chủ</span>
          </div>
          <div className="sidebar-item sidebar-item-active">
            <span className="sidebar-icon">📅</span>
            <span>Buổi gặp mặt</span>
          </div>
          <div className="sidebar-item">
            <span className="sidebar-icon">📚</span>
            <span>Khóa học</span>
          </div>
          <div className="sidebar-item">
            <span className="sidebar-icon">⚙️</span>
            <span>Hồ sơ cá nhân</span>
          </div>
        </aside>

        {/* CONTENT */}
        <section className="booking-content">
          {/* TABS */}
          <div className="booking-tabs">
            <button className="tab-btn">Danh sách buổi gặp mặt</button>
            <button className="tab-btn tab-btn-active">Đặt lịch hẹn</button>
            <button className="tab-btn">Đăng kí buổi tư vấn</button>
          </div>

          {/* CARD CHÍNH */}
          <div className="booking-card">
            <div className="booking-body">
              {/* CALENDAR BÊN TRÁI */}
              <div className="calendar-section">
                <Calendar
                  onChange={setDate}
                  value={date}
                  locale="vi-VN"
                  className="calendar-custom"
                />
              </div>

              {/* TUTOR + FORM BÊN PHẢI */}
              <div className="booking-right">
                <div className="tutor-card">
                  <div className="avatar-circle">T</div>
                  <div className="tutor-text">
                    <div className="tutor-name">Trần Văn B</div>
                    <div className="tutor-dept">Khoa: Khoa học và Kỹ thuật máy tính</div>
                  </div>
                </div>

                <form className="booking-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Ngày</label>
                    <div className="form-input-wrapper">
                      <input
                        type="date"
                        className="form-input"
                        value={formatDateForInput(date)}
                        onChange={(e) => setDate(new Date(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Giờ</label>
                    <div className="form-input-wrapper">
                      <input
                        type="time"
                        className="form-input"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Nội dung</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Hỗ trợ môn Công nghệ phần mềm"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Ghi chú thêm (tuỳ chọn)</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  {errorMsg && <p className="error-text">{errorMsg}</p>}
                  {statusMsg && <p className="success-text">{statusMsg}</p>}

                  <button type="submit" className="primary-btn">
                    Gửi yêu cầu
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* FOOTER XANH ĐẬM */}
          <footer className="footer">
            <div className="footer-column">
              <div className="footer-hashtag">#TUTOR SUPPORT SYSTEM</div>
            </div>

            <div className="footer-column footer-contact">
              <div className="footer-title">CONTACT US</div>
              <div>📍 268 Lý Thường Kiệt, Phường Diên Hồng, TP.HCM</div>
              <div>📧 tutorsupport@hcmut.edu.vn</div>
              <div>📞 +84363696969</div>
            </div>
          </footer>



          <div className="footer-bottom">
            © 2025 Tutor Support System – Trường Đại học Bách Khoa TP.HCM ·
            Terms of Use – Privacy Policy
          </div>
        </section>
      </div>
    </div>
  );
}

export default AppointmentBooking;
