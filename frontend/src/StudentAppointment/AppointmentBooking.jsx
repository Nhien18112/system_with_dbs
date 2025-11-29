// src/AppointmentBooking.jsx
import "./AppointmentBooking.css";
import React, { useState, useEffect } from "react";
import Calendar from "./Calendar"; 

// Import service
import {
  bookAppointment,
  getTutorFreeSlots,
  getStudentAppointments,
  cancelAppointment,
  getOfficialMeetings, // <-- IMPORT MỚI
  cancelMeeting        // <-- IMPORT MỚI
} from "../service/studentService"; // <-- Đảm bảo đường dẫn đúng folder services

function AppointmentBooking({ studentId = 1, tutorId = 1 }) {
  // --------- STATE ----------
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(""); 
  const [preferredStart, setPreferredStart] = useState(""); 
  const [preferredEnd, setPreferredEnd] = useState("");     
  const [topic, setTopic] = useState("");
  
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  // State cho Tab Lịch hẹn (Booking History)
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState("");

  // State cho Tab Danh sách buổi gặp mặt (Official Meetings)
  const [meetingList, setMeetingList] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);

  // tab: "list" | "book" | "consult"
  const [activeTab, setActiveTab] = useState("list"); 

  // --------- LỊCH RẢNH TUTOR ----------
  const [freeSlots, setFreeSlots] = useState([]);          
  const [availableRanges, setAvailableRanges] = useState([]); 
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  // --------- HELPERS ----------
  const toLocalDateString = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const formatDateForInput = (d) => toLocalDateString(d);

  // Format hiển thị ngày giờ đẹp: "14:00 - 17:00, ngày 27/10/2025"
  const formatDateTimeFull = (startStr, endStr) => {
    if (!startStr || !endStr) return "N/A";
    const start = new Date(startStr);
    const end = new Date(endStr);
    
    const dateLabel = start.toLocaleDateString("vi-VN");
    const startTime = start.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
    const endTime = end.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
    
    return `${startTime} - ${endTime}, ngày ${dateLabel}`;
  };

  // --------- API CALLS ----------

  // 1. Lấy Lịch rảnh (Tab Book)
  useEffect(() => {
    if (activeTab === 'book') {
        const fetchSlots = async () => {
        try {
            setLoadingSlots(true);
            setSlotsError("");
            setFreeSlots([]);
            setAvailableRanges([]);
            setTime("");

            const data = await getTutorFreeSlots(tutorId);
            const safeData = Array.isArray(data) ? data : [];
            setFreeSlots(safeData);

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
    }
  }, [tutorId, activeTab]); 
  
  // 2. Lấy Lịch sử Appointment (Tab Book - Bottom)
  const loadAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      setAppointmentsError("");
      const data = await getStudentAppointments(studentId || 1);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Get appointments error:", err);
      setAppointmentsError("Không tải được danh sách lịch hẹn.");
    } finally {
      setAppointmentsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'book') {
        loadAppointments();
    }
  }, [studentId, activeTab]);

  // 3. Lấy Danh sách Meeting chính thức (Tab List)
  const fetchOfficialMeetings = async () => {
    try {
      setLoadingMeetings(true);
      const data = await getOfficialMeetings(studentId || 1);
      setMeetingList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi tải meetings:", err);
    } finally {
      setLoadingMeetings(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'list') {
        fetchOfficialMeetings();
    }
  }, [studentId, activeTab]);

  // --------- HANDLERS ----------

  const handleChangeDate = (newDate) => {
    setDate(newDate);
    const key = toLocalDateString(newDate);
    const slot = freeSlots.find(
      (s) => s.date === key && s.timeRanges && s.timeRanges.length
    );

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

  const handleCustomCalendarSelect = (dateString) => {
      const newDate = new Date(dateString);
      handleChangeDate(newDate);
  };

  const availableDatesList = freeSlots.map(slot => slot.date);

  // Submit Đặt lịch
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg("");
    setErrorMsg("");

    if (!time) {
      setErrorMsg("Vui lòng chọn khung giờ rảnh của tutor.");
      return;
    }
    if (!preferredStart || !preferredEnd) {
      setErrorMsg("Vui lòng nhập giờ hẹn bạn mong muốn.");
      return;
    }
    if (!topic.trim()) {
      setErrorMsg("Vui lòng nhập nội dung buổi hẹn.");
      return;
    }

    const dateKey = toLocalDateString(date); 
    // Logic validate giờ... (giữ nguyên như cũ)
    const selectedSlot = availableRanges.find((range) => {
        const startLabel = range.startTime.slice(0, 5); 
        const endLabel = range.endTime.slice(0, 5);     
        const label = `${startLabel} - ${endLabel}`;
        return label === time;
    });

    // Simple validation (bạn có thể giữ lại logic toMinutes kỹ hơn ở code cũ nếu cần)
    if (!selectedSlot) { /* ... */ }

    const studentTimeRange = `${preferredStart} - ${preferredEnd}`;

    try {
      await bookAppointment({
        studentId: studentId || 1, 
        tutorId: tutorId || 1,
        dateKey,
        timeRange: studentTimeRange,
        topic: topic.trim(),
      });

      setStatusMsg("Đặt lịch thành công!");
      loadAppointments(); // Reload list dưới
    } catch (err) {
      console.error("Booking error:", err);
      const status = err.response?.status;
      const msg = err.response?.data || "";
      setErrorMsg(`Lỗi từ server (status ${status}): ${msg}`);
    }
  };

  // Handler Hủy Meeting (Tab List)
  const handleCancelMeeting = async (meetingId) => {
    const reason = window.prompt("Vui lòng nhập lý do hủy:");
    if (reason === null) return; 
    if (!reason.trim()) {
      alert("Lý do không được để trống!");
      return;
    }

    try {
      await cancelMeeting(meetingId, reason);
      alert("Đã hủy thành công!");
      fetchOfficialMeetings(); // Load lại list
    } catch (err) {
      alert("Hủy thất bại: " + (err.response?.data || "Lỗi server"));
    }
  };

  // Handler Hủy Appointment (Tab Book - History)
  const handleCancelAppointment = async (appt) => {
    const reason = window.prompt("Lý do hủy:");
    if (!reason) return;
    try {
        await cancelAppointment(appt.meetingId, reason);
        loadAppointments();
    } catch(err) {
        alert("Lỗi hủy: " + err);
    }
  }

  // --------- RENDER COMPONENT ----------

  // 1. Render List cho Tab "Danh sách buổi gặp mặt"
  const renderMeetingList = () => {
    if (loadingMeetings) return <p>Đang tải danh sách...</p>;
    if (meetingList.length === 0) return <p>Bạn chưa có buổi gặp mặt nào sắp tới.</p>;

    return (
      <div className="meeting-list-container">
        {meetingList.map((mt) => {
          // Backend trả về type: "APPOINTMENT" hoặc "CONSULTATION"
          const isAppointment = mt.type === "APPOINTMENT";
          const badgeLabel = isAppointment ? "BUỔI HẸN" : "BUỔI HỘI THẢO";
          const badgeClass = isAppointment ? "badge-appointment" : "badge-consultation";
          
          const locationInfo = mt.onlineLink ? `Online: ${mt.onlineLink}` : "Hình thức: Online (Google Meet)";

          return (
            <div key={mt.meetingId} className="meeting-card">
              {/* CỘT TRÁI */}
              <div className="meeting-info">
                <div className="meeting-topic">
                  Chủ đề: {mt.topic}
                </div>
                <div className="meeting-time">
                  Thời gian: {formatDateTimeFull(mt.startTime, mt.endTime)}
                </div>
                <div className="meeting-detail">
                  {locationInfo}
                </div>
              </div>

              {/* CỘT PHẢI */}
              <div className="meeting-actions">
                <span className={`meeting-badge ${badgeClass}`}>
                  {badgeLabel}
                </span>
                
                {mt.status === "SCHEDULED" && (
                  <button 
                    className="btn-cancel-meeting"
                    onClick={() => handleCancelMeeting(mt.meetingId)}
                  >
                    Hủy đăng ký
                  </button>
                )}
                
                {mt.status === "CANCELLED" && (
                    <span className="status-cancelled">ĐÃ HỦY</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 2. Render List cho Tab "Lịch hẹn" (Lịch sử Booking)
  const renderAppointmentList = () => {
    if (appointmentsLoading) return <p>Đang tải...</p>;
    if (!appointments.length) return <p>Hiện chưa có lịch hẹn nào.</p>;

    return (
      <div className="appointment-list">
        {appointments.map((appt) => {
          const status = (appt.appointmentStatus || appt.status || "PENDING").toUpperCase();
          const startIso = appt.startTime || appt.date;
          const endIso = appt.endTime;
          let dateLabel = "";
          let timeLabel = "";

          if (startIso) {
            const start = new Date(startIso);
            const end = endIso ? new Date(endIso) : null;
            dateLabel = start.toLocaleDateString("vi-VN");
            timeLabel = end
              ? `${start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
              : start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
          }
          return (
            <div key={appt.meetingId} className="appointment-card">
              <div className="appointment-main">
                <div className="appointment-topic">{appt.topic}</div>
                <div className="appointment-meta">
                  <span>{dateLabel}</span><span>•</span><span>{timeLabel}</span>
                </div>
              </div>
              <div className="appointment-actions">
                <span className={`status-badge status-${status.toLowerCase()}`}>{status}</span>
                {status === "PENDING" && (
                  <button type="button" className="btn-cancel-appointment" onClick={() => handleCancelAppointment(appt)}>Hủy</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="booking-page">
      {/* TABS */}
      <div className="booking-tabs">
        <button
          className={`tab-btn ${activeTab === "list" ? "tab-btn-active" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          Danh sách buổi gặp mặt
        </button>
        <button
          className={`tab-btn ${activeTab === "book" ? "tab-btn-active" : ""}`}
          onClick={() => setActiveTab("book")}
        >
          Lịch hẹn
        </button>
        <button
          className={`tab-btn ${activeTab === "consult" ? "tab-btn-active" : ""}`}
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
            <div className="tutor-dept">Khoa: Khoa học và Kỹ thuật máy tính</div>
          </div>
        </div>
      </div>

      {/* TAB: DANH SÁCH BUỔI GẶP MẶT */}
      {activeTab === "list" && (
        <div className="booking-card">
          <h3 className="card-section-title">Buổi gặp mặt của tôi</h3>
          <div className="booking-body" style={{ display: 'block' }}> 
            {renderMeetingList()}
          </div>
        </div>
      )}

      {/* TAB: LỊCH HẸN (BOOKING) */}
      {activeTab === "book" && (
        <>
          <div className="booking-card">
            <h3 className="card-section-title">Đặt lịch hẹn</h3>
            <div className="booking-body">
              <div className="calendar-section">
                <Calendar
                    activeDate={toLocalDateString(date)}
                    onSelect={handleCustomCalendarSelect}
                    availableDates={availableDatesList}
                />
                {slotsError && <p className="error-text" style={{ marginTop: 8 }}>{slotsError}</p>}
              </div>

              <div className="booking-right">
                <form className="booking-form" onSubmit={handleSubmit}>
                  {/* ... (Giữ nguyên form inputs như cũ) ... */}
                   <div className="form-group">
                    <label>Ngày đã chọn</label>
                    <div className="form-input-wrapper">
                      <input type="date" className="form-input" value={formatDateForInput(date)} readOnly />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Khung giờ rảnh của tutor</label>
                    <select
                        className="form-input"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        disabled={loadingSlots || availableRanges.length === 0}
                      >
                        {loadingSlots && <option>Đang tải khung giờ...</option>}
                        {!loadingSlots && availableRanges.length === 0 && <option value="">Không có khung giờ rảnh</option>}
                        {!loadingSlots && availableRanges.map((range, idx) => {
                            const l = `${range.startTime.slice(0, 5)} - ${range.endTime.slice(0, 5)}`;
                            return <option key={idx} value={l}>{l}</option>;
                          })}
                      </select>
                  </div>
                  <div className="form-group">
                    <label>Giờ hẹn bạn mong muốn</label>
                    <div className="form-input-wrapper" style={{ display: "flex", gap: 8 }}>
                      <input type="time" className="form-input" value={preferredStart} onChange={(e) => setPreferredStart(e.target.value)} disabled={availableRanges.length === 0 || !time} />
                      <span style={{ alignSelf: "center" }}>–</span>
                      <input type="time" className="form-input" value={preferredEnd} onChange={(e) => setPreferredEnd(e.target.value)} disabled={availableRanges.length === 0 || !time} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Nội dung</label>
                    <input type="text" className="form-input" placeholder="Nhập nội dung" value={topic} onChange={(e) => setTopic(e.target.value)} />
                  </div>
                  {errorMsg && <p className="error-text">{errorMsg}</p>}
                  {statusMsg && <p className="success-text">{statusMsg}</p>}
                  <button type="submit" className="primary-btn">Gửi yêu cầu</button>
                </form>
              </div>
            </div>
          </div>

          <div className="booking-card" style={{ marginTop: '20px' }}>
            <h3 className="card-section-title">Lịch sử đặt hẹn</h3>
            {renderAppointmentList()}
          </div>
        </>
      )}

      {/* TAB: ĐĂNG KÍ BUỔI TƯ VẤN */}
      {activeTab === "consult" && (
        <div className="booking-card">
          <h3 className="card-section-title">Đăng kí buổi tư vấn</h3>
          <div className="booking-body">
            <p>Tab đăng kí buổi tư vấn sẽ được triển khai sau.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentBooking;