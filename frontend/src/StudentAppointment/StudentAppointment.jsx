// src/StudentAppointment.jsx
import "./StudentAppointment.css";
import React, { useState, useEffect } from "react";
import Calendar from "./Calendar";

// Import service
import {
  bookAppointment,
  getTutorFreeSlots,
  getStudentAppointments,
  cancelAppointment,
  getOfficialMeetings,
  getCancelableMeetings,
  cancelMeeting,
} from "../service/studentService";

// --- MOCK DATA  ---
const rawSampleData = [
  {
    meetingID: 1,
    date: "2025-11-30",
    timestart: "08:00",
    timeend: "10:00",
    topic: "Nguyên lý ngôn ngữ lập trình",
  },
  {
    meetingID: 2,
    date: "2025-12-01",
    timestart: "14:00",
    timeend: "16:00",
    topic: "Lập trình Web - ReactJS cơ bản",
  },
  {
    meetingID: 3,
    date: "2025-12-12",
    timestart: "09:30",
    timeend: "11:30",
    topic: "Hội thảo AI trong giáo dục Đại học hiện nay",
  },
];

// --- MOCK MEETINGS ---

let mockMeetings = rawSampleData.map((item, index) => ({
  meetingId: item.meetingID,
  topic: item.topic,
  startTime: `${item.date}T${item.timestart}:00`,
  endTime: `${item.date}T${item.timeend}:00`,

  type: index === 1 ? "CONSULTATION" : "APPOINTMENT",

  status: "SCHEDULED",
  onlineLink: "https://meet.google.com/sample-link",
  studentId: 1,
  tutorId: 1,
}));

// ---------- HELPER: status & filter ----------
const isCancelled = (m) =>
  typeof m.status === "string" &&
  m.status.toUpperCase() === "CANCELLED";

const filterActiveMeetings = (list = []) =>
  list.filter((m) => !isCancelled(m));

const getCancelableFromMock = () => {
  const now = new Date();
  return mockMeetings.filter(
    (m) => !isCancelled(m) && new Date(m.startTime) > now
  );
};

const markMockCancelled = (meetingId) => {
  const idx = mockMeetings.findIndex((m) => m.meetingId === meetingId);
  if (idx !== -1) {
    mockMeetings[idx] = {
      ...mockMeetings[idx],
      status: "CANCELLED",
    };
  }
};

// --- HELPER: Tính trạng thái thời gian ---
const getTimeStatus = (startStr, endStr) => {
  const now = new Date();
  const start = new Date(startStr);
  const end = new Date(endStr);

  if (now > end)
    return { label: "Đã diễn ra", className: "time-status-past" };
  if (now >= start && now <= end)
    return { label: "Đang diễn ra", className: "time-status-ongoing" };
  return { label: "Sắp diễn ra", className: "time-status-upcoming" };
};

// Helper Format Date
const formatDateTimeFull = (startStr, endStr) => {
  if (!startStr || !endStr) return "N/A";
  const start = new Date(startStr);
  const end = new Date(endStr);
  const dateLabel = start.toLocaleDateString("vi-VN");
  const startTime = start.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${startTime} - ${endTime}, ngày ${dateLabel}`;
};

const formatDateForInput = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const toLocalDateString = (d) => formatDateForInput(d);

function StudentAppointment({ studentId = 5, tutorId = 1 }) {
  // --------- STATE CHÍNH ----------
  const [activeTab, setActiveTab] = useState("list");

  // State cho Tab List (Danh sách buổi gặp mặt)
  const [meetingList, setMeetingList] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [isCancelMode, setIsCancelMode] = useState(false); // Chế độ Hủy

  // State cho Tab Book (Đặt lịch)
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("");
  const [preferredStart, setPreferredStart] = useState("");
  const [preferredEnd, setPreferredEnd] = useState("");
  const [topic, setTopic] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [freeSlots, setFreeSlots] = useState([]);
  const [availableRanges, setAvailableRanges] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  // Modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [cancelReasonInput, setCancelReasonInput] = useState("");

  // --------- API: LOAD DANH SÁCH ----------
  const fetchMeetings = async () => {
    try {
      setLoadingMeetings(true);
      let data = [];

      if (isCancelMode) {
        try {
          data = await getCancelableMeetings(studentId || 5);
        } catch (e) {
          console.warn(
            "API getCancelableMeetings lỗi, fallback mock cancelable"
          );
          data = [];
        }

        if (Array.isArray(data) && data.length > 0) {
          setMeetingList(filterActiveMeetings(data));
        } else {
          setMeetingList(getCancelableFromMock());
        }
      } else {
        try {
          data = await getOfficialMeetings(studentId || 5);
        } catch (e) {
          console.warn(
            "API getOfficialMeetings lỗi, fallback mock all meetings"
          );
          data = [];
        }

        if (Array.isArray(data) && data.length > 0) {
          setMeetingList(filterActiveMeetings(data));
        } else {
          setMeetingList(filterActiveMeetings(mockMeetings));
        }
      }
    } catch (err) {
      console.error("Lỗi tải meetings:", err);
      if (isCancelMode) {
        setMeetingList(getCancelableFromMock());
      } else {
        setMeetingList(filterActiveMeetings(mockMeetings));
      }
    } finally {
      setLoadingMeetings(false);
    }
  };


  useEffect(() => {
    if (activeTab === "list") {
      fetchMeetings();
    }

  }, [studentId, activeTab, isCancelMode]);

  // --------- HANDLERS: BOOKING ----------
  useEffect(() => {
    if (activeTab === "book") {
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
          if (todaySlot?.timeRanges?.length) {
            setAvailableRanges(todaySlot.timeRanges);
            const first = todaySlot.timeRanges[0];
            setTime(
              `${first.startTime.slice(0, 5)} - ${first.endTime.slice(
                0,
                5
              )}`
            );
          }
        } catch (err) {
          setSlotsError("Không tải được lịch rảnh.");
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [tutorId, activeTab, date]);

  const handleChangeDate = (newDate) => {
    setDate(newDate);
    const key = toLocalDateString(newDate);
    const slot = freeSlots.find((s) => s.date === key && s.timeRanges?.length);
    if (slot) {
      setAvailableRanges(slot.timeRanges);
      const first = slot.timeRanges[0];
      setTime(
        `${first.startTime.slice(0, 5)} - ${first.endTime.slice(0, 5)}`
      );
    } else {
      setAvailableRanges([]);
      setTime("");
    }
  };

  const handleCustomCalendarSelect = (dateString) =>
    handleChangeDate(new Date(dateString));
  const availableDatesList = freeSlots.map((slot) => slot.date);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg("");
    setErrorMsg("");
    
    // Debug: Check topic type
    console.log("handleSubmit - topic:", topic);
    console.log("handleSubmit - topic typeof:", typeof topic);
    if (typeof topic !== 'string') {
      console.error("ERROR: topic is not a string!", topic);
      setErrorMsg("Lỗi: Nội dung không hợp lệ (phải là chuỗi)");
      return;
    }
    
    if (!time || !preferredStart || !preferredEnd || !topic.trim()) {
      setErrorMsg("Vui lòng điền đủ thông tin.");
      return;
    }
    const dateKey = toLocalDateString(date);
    const studentTimeRange = `${preferredStart} - ${preferredEnd}`;
    try {
      await bookAppointment({
        studentId: studentId || 5,
        tutorId: tutorId || 1,
        dateKey,
        timeRange: studentTimeRange,
        topic: topic.trim(),
      });
      setStatusMsg("Đặt lịch thành công! Vui lòng chờ Tutor duyệt.");
    } catch (err) {
      // Handle error - convert object to string if needed
      let errorMsg = "Server error";
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } else if (err.response.data.error) {
          errorMsg = err.response.data.error;
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        } else {
          errorMsg = JSON.stringify(err.response.data);
        }
      }
      setErrorMsg(`Lỗi: ${errorMsg}`);
    }
  };

  // --------- HANDLERS: CANCEL ----------
  const handleToggleCancelMode = () => {
    setIsCancelMode(!isCancelMode);
  };

  const handleOpenCancelModal = (id) => {
    setSelectedMeetingId(id);
    setCancelReasonInput("");
    setShowCancelModal(true);
  };
  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setSelectedMeetingId(null);
  };

  const handleConfirmCancel = async () => {
    if (!cancelReasonInput.trim()) {
      alert("Nhập lý do!");
      return;
    }

    const meetingId = selectedMeetingId;
    if (!meetingId) return;

    const isMock = mockMeetings.some((m) => m.meetingId === meetingId);

    if (isMock) {
      markMockCancelled(meetingId);
      alert("Hủy buổi gặp mặt thành công!");
      await fetchMeetings();
      handleCloseCancelModal();
      return;
    }

    try {
      await cancelMeeting(meetingId, cancelReasonInput);

      markMockCancelled(meetingId);
      alert("Đã hủy thành công!");
      await fetchMeetings();
      handleCloseCancelModal();
    } catch (err) {
      console.error("Hủy meeting lỗi:", err);
      alert("Hủy thất bại!");
    }
  };

  // --------- RENDER LIST ----------
  const renderMeetingList = () => {
    if (loadingMeetings) return <p>Đang tải danh sách...</p>;

    const visibleMeetings = filterActiveMeetings(meetingList);
    
    // Debug log to check meeting data structure
    if (visibleMeetings.length > 0) {
      console.log("Meeting data structure:", visibleMeetings[0]);
      console.log("Topic value:", visibleMeetings[0].topic);
      console.log("Topic typeof:", typeof visibleMeetings[0].topic);
    }

    if (visibleMeetings.length === 0)
      return <p>Không có buổi gặp mặt nào.</p>;

    return (
      <div className="meeting-list-container">
        {visibleMeetings.map((mt) => {
          const isAppt = mt.type === "APPOINTMENT";
          const badgeLabel = isAppt ? "BUỔI HẸN" : "BUỔI HỘI THẢO";
          const badgeClass = isAppt
            ? "badge-appointment"
            : "badge-consultation";

          const timeStatus = getTimeStatus(mt.startTime, mt.endTime);

          return (
            <div key={mt.meetingId} className="meeting-card">
              <div className="meeting-info">
                <div className="meeting-topic">Chủ đề: {typeof mt.topic === 'string' ? mt.topic : JSON.stringify(mt.topic)}</div>
                <div className="meeting-time">
                  Thời gian:{" "}
                  {formatDateTimeFull(mt.startTime, mt.endTime)}
                </div>
                <div className="meeting-detail">
                  {mt.onlineLink
                    ? `Online: ${mt.onlineLink}`
                    : "Online (Google Meet)"}
                </div>
              </div>

              <div className="meeting-actions">
                <span className={`meeting-badge ${badgeClass}`}>
                  {badgeLabel}
                </span>

                {isCancelMode ? (
                  <button
                    className="btn-cancel-meeting"
                    onClick={() => handleOpenCancelModal(mt.meetingId)}
                  >
                    Hủy đăng ký
                  </button>
                ) : (
                  <span
                    className={`time-status-label ${timeStatus.className}`}
                  >
                    {timeStatus.label}
                  </span>
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

      {activeTab === "list" && (
        <div className="booking-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              borderBottom: "1px solid #eee",
              paddingBottom: "10px",
            }}
          >
            <h3
              className="card-section-title"
              style={{ border: "none", margin: 0, padding: 0 }}
            >
              {isCancelMode
                ? "Chọn buổi gặp mặt để hủy"
                : "Buổi gặp mặt của tôi"}
            </h3>

            <button
              className={`btn-mode-switch ${
                isCancelMode ? "btn-back-mode" : "btn-cancel-mode"
              }`}
              onClick={handleToggleCancelMode}
            >
              {isCancelMode
                ? "← Quay lại danh sách"
                : "Hủy đăng ký"}
            </button>
          </div>

          <div className="booking-body">{renderMeetingList()}</div>
        </div>
      )}

      {activeTab === "book" && (
        <div className="booking-card">
          <h3 className="card-section-title">Đặt lịch hẹn</h3>
          <div className="booking-body">
            <div className="calendar-section">
              <Calendar
                activeDate={toLocalDateString(date)}
                onSelect={handleCustomCalendarSelect}
                availableDates={availableDatesList}
              />
              {slotsError && (
                <p className="error-text">{slotsError}</p>
              )}
            </div>
            <div className="booking-right">
              <form className="booking-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Ngày đã chọn</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formatDateForInput(date)}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Khung giờ rảnh</label>
                  <select
                    className="form-input"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    disabled={
                      loadingSlots || !availableRanges.length
                    }
                  >
                    {loadingSlots && <option>Đang tải...</option>}
                    {!loadingSlots &&
                      !availableRanges.length && (
                        <option value="">
                          Không có giờ rảnh
                        </option>
                      )}
                    {!loadingSlots &&
                      availableRanges.map((r, i) => (
                        <option
                          key={i}
                          value={`${r.startTime.slice(
                            0,
                            5
                          )} - ${r.endTime.slice(0, 5)}`}
                        >
                          {`${r.startTime.slice(
                            0,
                            5
                          )} - ${r.endTime.slice(0, 5)}`}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Giờ mong muốn</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="time"
                      className="form-input"
                      value={preferredStart}
                      onChange={(e) =>
                        setPreferredStart(e.target.value)
                      }
                    />
                    <span style={{ alignSelf: "center" }}>-</span>
                    <input
                      type="time"
                      className="form-input"
                      value={preferredEnd}
                      onChange={(e) =>
                        setPreferredEnd(e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Nội dung</label>
                  <input
                    type="text"
                    className="form-input"
                    value={typeof topic === 'string' ? topic : ''}
                    onChange={(e) => {
                      console.log("Topic input onChange, value:", e.target.value);
                      setTopic(e.target.value);
                    }}
                  />
                </div>
                {errorMsg && (
                  <p className="error-text">{errorMsg}</p>
                )}
                {statusMsg && (
                  <p className="success-text">{statusMsg}</p>
                )}
                <button type="submit" className="primary-btn">
                  Gửi yêu cầu
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === "consult" && (
        <div className="booking-card">
          <h3 className="card-section-title">
            Đăng kí buổi tư vấn
          </h3>
          <div className="booking-body">
            <p>Chức năng đang phát triển...</p>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div
          className="modal-overlay"
          onClick={handleCloseCancelModal}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">Xác nhận hủy đăng ký</div>
            <div className="modal-body">
              <p>
                Bạn có chắc chắn muốn hủy không? Vui lòng nhập lý do:
              </p>
              <textarea
                value={cancelReasonInput}
                onChange={(e) =>
                  setCancelReasonInput(e.target.value)
                }
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn-modal-close"
                onClick={handleCloseCancelModal}
              >
                Đóng
              </button>
              <button
                className="btn-modal-confirm"
                onClick={handleConfirmCancel}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentAppointment;
