// src/AppointmentBooking.jsx
import "./AppointmentBooking.css";
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { bookAppointment, getTutorFreeSlots } from "./service/studentService";

function AppointmentBooking({ studentId = 1, tutorId = 1 }) {
  // --------- STATE CƠ BẢN ----------
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(""); // "HH:mm - HH:mm"
  const [topic, setTopic] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // tab: "list" | "book" | "consult"
  const [activeTab, setActiveTab] = useState("list"); // mở "Danh sách buổi gặp mặt" trước

  // --------- LỊCH RẢNH TUTOR ----------
  const [freeSlots, setFreeSlots] = useState([]);          // toàn bộ FreeSlotResponse backend trả về
  const [availableRanges, setAvailableRanges] = useState([]); // timeRanges của ngày đang chọn
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  // --------- HÀM FORMAT NGÀY/GIỜ ----------
  // yyyy-MM-dd theo giờ local (tránh lệch ngày do toISOString)
  const toLocalDateString = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };


  const formatDateForInput = (d) => toLocalDateString(d);

  const findSlotByDate = (key) =>
    freeSlots.find(
      (slot) => slot.date === key && slot.timeRanges && slot.timeRanges.length
    );

  // --------- LẤY LỊCH RẢNH TỪ BACKEND LẦN ĐẦU ----------
  // --------- LẤY LỊCH RẢNH TỪ BACKEND ----------
  // Chỉ cần chạy lại khi tutorId đổi
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setLoadingSlots(true);
        setSlotsError("");
        setFreeSlots([]);
        setAvailableRanges([]);
        setTime("");

        const data = await getTutorFreeSlots(tutorId);
        console.log("Slots from backend in AppointmentBooking:", data);
        const safeData = Array.isArray(data) ? data : [];
        setFreeSlots(safeData);

        // set sẵn khung giờ cho ngày đang chọn nếu có
        const todayKey = toLocalDateString(date);
        const todaySlot = safeData.find((s) => s.date === todayKey);

        if (todaySlot && todaySlot.timeRanges && todaySlot.timeRanges.length) {
          setAvailableRanges(todaySlot.timeRanges);
          const first = todaySlot.timeRanges[0];
          const startLabel = first.startTime.slice(0, 5);
          const endLabel = first.endTime.slice(0, 5);
          setTime(`${startLabel} - ${endLabel}`);
        }
      } catch (err) {
        console.error("Get free slots error:", err);
        setSlotsError("Không tải được lịch rảnh của tutor.");
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [tutorId]); // <-- chỉ tutorId

  const handleChangeDate = (newDate) => {
    setDate(newDate);
    const key = toLocalDateString(newDate);
    const slot = findSlotByDate(key);

    if (slot) {
      setAvailableRanges(slot.timeRanges);
      const first = slot.timeRanges[0];
      const startLabel = first.startTime.slice(0, 5);
      const endLabel = first.endTime.slice(0, 5);
      setTime(`${startLabel} - ${endLabel}`);
    } else {
      setAvailableRanges([]);
      setTime("");
    }
  };


  // --------- SUBMIT ĐẶT LỊCH ----------
  const handleSubmit = async (e) => {
  e.preventDefault();
  setStatusMsg("");
  setErrorMsg("");

  if (!time) {
    setErrorMsg("Vui lòng chọn khung giờ rảnh.");
    return;
  }
  if (!topic.trim()) {
    setErrorMsg("Vui lòng nhập nội dung buổi hẹn.");
    return;
  }

  // Chuyển Date -> "YYYY-MM-DD"
  const dateKey = toLocalDateString(date); // vd: "2025-12-01"

  try {
    await bookAppointment({
      studentId: studentId || 1,  // có props thì dùng, không thì mock 1
      tutorId: tutorId || 1,
      dateKey,
      timeRange: time,            // "07:00 - 09:00"
      topic: topic.trim(),        // dùng topic đúng với DTO
    });

    setStatusMsg("Đặt lịch thành công!");
  } catch (err) {
    console.error("Booking error:", err);
    const status = err.response?.status;
    const msg = err.response?.data || "";
    setErrorMsg(`Lỗi từ server (status ${status}): ${msg}`);
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
          <span className="top-title">Buổi gặp mặt [Student]</span>
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
            <button
              className={`tab-btn ${
                activeTab === "list" ? "tab-btn-active" : ""
              }`}
              onClick={() => setActiveTab("list")}
            >
              Danh sách buổi gặp mặt
            </button>
            <button
              className={`tab-btn ${
                activeTab === "book" ? "tab-btn-active" : ""
              }`}
              onClick={() => setActiveTab("book")}
            >
              Lịch hẹn
            </button>
            <button
              className={`tab-btn ${
                activeTab === "consult" ? "tab-btn-active" : ""
              }`}
              onClick={() => setActiveTab("consult")}
            >
              Đăng kí buổi tư vấn
            </button>
          </div>

          {/* TUTOR INFO */}
          <div className="tutor-section">
            <div className="tutor-section-title">Tutor của bạn</div>
            <div className="tutor-card">
              <div className="avatar-circle">T</div>
              <div className="tutor-info">
                <div className="tutor-name">Trần Văn B</div>
                <div className="tutor-dept">
                  Khoa: Khoa học và Kỹ thuật máy tính
                </div>
              </div>
            </div>
          </div>

          {/* TAB: DANH SÁCH BUỔI GẶP MẶT (tạm placeholder) */}
          {activeTab === "list" && (
            <div className="booking-card">
              <div className="booking-body">
                <p>
                  Danh sách buổi gặp mặt sẽ được kết nối với API meetings sau.
                </p>
              </div>
            </div>
          )}

          {/* TAB: LỊCH HẸN */}
          {activeTab === "book" && (
            <div className="booking-card">
              <div className="booking-body">
                {/* CALENDAR LEFT */}
                <div className="calendar-section">
                  <Calendar
                    onChange={handleChangeDate}
                    value={date}
                    locale="vi-VN"
                    className="calendar-custom"
                    tileClassName={({ date: tileDate, view }) => {
                      if (view !== "month") return null;
                      const key = toLocalDateString(tileDate);
                      const slot = findSlotByDate(key);
                      return slot ? "calendar-day-available" : null;
                    }}
                  />

                  {slotsError && (
                    <p className="error-text" style={{ marginTop: 8 }}>
                      {slotsError}
                    </p>
                  )}
                </div>

                {/* FORM RIGHT */}
                <div className="booking-right">
                  <form className="booking-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label>Ngày</label>
                      <div className="form-input-wrapper">
                        <input
                          type="date"
                          className="form-input"
                          value={formatDateForInput(date)}
                          onChange={(e) =>
                            handleChangeDate(new Date(e.target.value))
                          }
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Giờ rảnh</label>
                      <div className="form-input-wrapper">
                        <select
                          className="form-input"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          disabled={
                            loadingSlots || availableRanges.length === 0
                          }
                        >
                          {loadingSlots && (
                            <option>Đang tải khung giờ...</option>
                          )}

                          {!loadingSlots &&
                            availableRanges.length === 0 && (
                              <option value="">
                                Không có khung giờ rảnh
                              </option>
                            )}

                          {!loadingSlots &&
                            availableRanges.map((range, idx) => {
                              const startLabel = range.startTime.slice(0, 5);
                              const endLabel = range.endTime.slice(0, 5);
                              const label = `${startLabel} - ${endLabel}`;
                              return (
                                <option key={idx} value={label}>
                                  {label}
                                </option>
                              );
                            })}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Nội dung</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Nhập nội dung"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
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
          )}

          {/* TAB: ĐĂNG KÍ BUỔI TƯ VẤN (placeholder) */}
          {activeTab === "consult" && (
            <div className="booking-card">
              <div className="booking-body">
                <p>Tab đăng kí buổi tư vấn sẽ được triển khai sau.</p>
              </div>
            </div>
          )}

          {/* FOOTER */}
          <footer className="footer">
            <div className="footer-column">
              <div className="footer-hashtag">#TUTOR SUPPORT SYSTEM</div>
            </div>

            <div className="footer-column footer-contact">
              <div className="footer-title">CONTACT US</div>
              <div>Địa chỉ: 268 Lý Thường Kiệt, Phường Diên Hồng, TP.HCM</div>
              <div>Email: tutorsupport@hcmut.edu.vn</div>
              <div>Tel: +84363696969</div>
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
