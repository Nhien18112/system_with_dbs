// src/StudentAppointment.jsx
import "./StudentAppointment.css";
import React, { useState, useEffect } from "react";
import Calendar from "./Calendar";

// Import service
import {
  bookAppointment,
  getTutorFreeSlots,
  getOfficialMeetings,
  getCancelableMeetings,
  cancelMeeting,
  getMyTutor,
} from "../service/studentService";

// ---------- HELPER: Format & Status ----------

// Kiểm tra trạng thái hủy (nếu backend trả về status string)
const isCancelled = (m) =>
  m.status && typeof m.status === "string" && m.status.toUpperCase() === "CANCELLED";

// Lọc bỏ các cuộc họp đã hủy (nếu API trả về cả những cái đã hủy)
const filterActiveMeetings = (list = []) => {
  if (!Array.isArray(list)) return [];
  return list.filter((m) => !isCancelled(m));
};

// Helper: Tính trạng thái thời gian (Sắp diễn ra, Đang diễn ra, Đã qua)
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

// Helper: Format ngày giờ hiển thị
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

// Helper: Format ngày cho input type="date"
const formatDateForInput = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const toLocalDateString = (d) => formatDateForInput(d);

function StudentAppointment({ studentId = 5 }) {
  // --------- STATE CHÍNH ----------
  const [activeTab, setActiveTab] = useState("list");

  // State quản lý Tutor động (Lấy từ API)
  const [currentTutorId, setCurrentTutorId] = useState(null);
  const [myTutorInfo, setMyTutorInfo] = useState(null);
  const [tutorLoading, setTutorLoading] = useState(false);

  // State cho Tab List
  const [meetingList, setMeetingList] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [isCancelMode, setIsCancelMode] = useState(false);

  // State cho Tab Book
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

  // Modal Cancel
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [cancelReasonInput, setCancelReasonInput] = useState("");

  // --------- 1. API: LOAD THÔNG TIN TUTOR ----------
  useEffect(() => {
    const fetchTutor = async () => {
      if (!studentId) return;
      try {
        setTutorLoading(true);
        const tutorData = await getMyTutor(studentId);
        
        if (tutorData) {
          setCurrentTutorId(tutorData.tutorId);
          setMyTutorInfo(tutorData);
        }
      } catch (err) {
        console.error("Lỗi lấy thông tin Tutor:", err);
        setMyTutorInfo(null);
        setCurrentTutorId(null);
      } finally {
        setTutorLoading(false);
      }
    };
    fetchTutor();
  }, [studentId]);

  // --------- 2. API: LOAD DANH SÁCH CUỘC HỌP ----------
  const fetchMeetings = async () => {
    if (!studentId) return;
    try {
      setLoadingMeetings(true);
      let data = [];

      if (isCancelMode) {
        // Lấy danh sách có thể hủy
        data = await getCancelableMeetings(studentId);
      } else {
        // Lấy danh sách chính thức
        data = await getOfficialMeetings(studentId);
      }
      
      // Lọc và set state (không dùng mock)
      setMeetingList(filterActiveMeetings(data));

    } catch (err) {
      console.error("Lỗi tải meetings:", err);
      setMeetingList([]); // Lỗi thì danh sách rỗng
    } finally {
      setLoadingMeetings(false);
    }
  };

  useEffect(() => {
    if (activeTab === "list") {
      fetchMeetings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, activeTab, isCancelMode]);

  // --------- 3. API: LOAD SLOTS CỦA TUTOR ----------
  useEffect(() => {
    if (activeTab === "book" && currentTutorId) {
      const fetchSlots = async () => {
        try {
          setLoadingSlots(true);
          setSlotsError("");
          setFreeSlots([]);
          setAvailableRanges([]);
          setTime("");

          const data = await getTutorFreeSlots(currentTutorId);
          const safeData = Array.isArray(data) ? data : [];
          setFreeSlots(safeData);

          // Tự động chọn range đầu tiên nếu ngày hiện tại có slot
          const todayKey = toLocalDateString(date);
          const todaySlot = safeData.find((s) => s.date === todayKey);
          if (todaySlot?.timeRanges?.length) {
            setAvailableRanges(todaySlot.timeRanges);
            const first = todaySlot.timeRanges[0];
            setTime(`${first.startTime.slice(0, 5)} - ${first.endTime.slice(0, 5)}`);
          }
        } catch (err) {
          console.error("Lỗi tải slot:", err);
          setSlotsError("Không tải được lịch rảnh của Tutor.");
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [currentTutorId, activeTab, date]);

  // --------- HANDLERS: BOOKING ----------
  const handleChangeDate = (newDate) => {
    setDate(newDate);
    const key = toLocalDateString(newDate);
    const slot = freeSlots.find((s) => s.date === key && s.timeRanges?.length);
    
    if (slot) {
      setAvailableRanges(slot.timeRanges);
      const first = slot.timeRanges[0];
      setTime(`${first.startTime.slice(0, 5)} - ${first.endTime.slice(0, 5)}`);
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

    if (!currentTutorId) {
        setErrorMsg("Lỗi: Bạn chưa có Tutor nào được duyệt.");
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
        studentId: studentId,
        tutorId: currentTutorId,
        dateKey,
        timeRange: studentTimeRange,
        topic: topic.trim(),
      });
      setStatusMsg("Đặt lịch thành công! Vui lòng chờ Tutor duyệt.");
      // Reset form nhẹ
      setTopic("");
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
  const handleToggleCancelMode = () => setIsCancelMode(!isCancelMode);

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

    try {
      await cancelMeeting(meetingId, cancelReasonInput);
      alert("Đã hủy thành công!");
      await fetchMeetings(); // Reload lại danh sách sau khi hủy
      handleCloseCancelModal();
    } catch (err) {
      console.error("Hủy meeting lỗi:", err);
      alert("Hủy thất bại: " + (err.response?.data || "Lỗi server"));
    }
  };

  // --------- RENDER LIST ----------
  const renderMeetingList = () => {
    if (loadingMeetings) return <p>Đang tải danh sách từ hệ thống...</p>;
    
    // Đảm bảo meetingList luôn là mảng trước khi map
    const safeList = Array.isArray(meetingList) ? meetingList : [];
    
    if (safeList.length === 0)
      return <p>Không có buổi gặp mặt nào.</p>;

    return (
      <div className="meeting-list-container">
        {safeList.map((mt) => {
          const isAppt = mt.type === "APPOINTMENT";
          const badgeLabel = isAppt ? "BUỔI HẸN" : "BUỔI HỘI THẢO";
          const badgeClass = isAppt ? "badge-appointment" : "badge-consultation";
          const timeStatus = getTimeStatus(mt.startTime, mt.endTime);

          return (
            <div key={mt.meetingId} className="meeting-card">
              <div className="meeting-info">
                <div className="meeting-topic">Chủ đề: {typeof mt.topic === 'string' ? mt.topic : JSON.stringify(mt.topic)}</div>
                <div className="meeting-time">
                  Thời gian: {formatDateTimeFull(mt.startTime, mt.endTime)}
                </div>
                <div className="meeting-detail">
                  {mt.onlineLink ? `Online: ${mt.onlineLink}` : "Online (Google Meet)"}
                </div>
              </div>

              <div className="meeting-actions">
                <span className={`meeting-badge ${badgeClass}`}>{badgeLabel}</span>
                {isCancelMode ? (
                  <button
                    className="btn-cancel-meeting"
                    onClick={() => handleOpenCancelModal(mt.meetingId)}
                  >
                    Hủy đăng ký
                  </button>
                ) : (
                  <span className={`time-status-label ${timeStatus.className}`}>
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

      {/* --- TUTOR SECTION --- */}
      <div className="tutor-section">
        <div className="tutor-section-title">Tutor của tôi</div>
        
        {tutorLoading ? (
            <p>Đang tải thông tin...</p>
        ) : myTutorInfo ? (
            <div className="tutor-card">
              <div className="avatar-circle">T</div>
              <div className="tutor-info">
                {/* Hiển thị tên thật từ API hoặc ID */}
                <div className="tutor-name">
                    {myTutorInfo.fullName || `Tutor ID: ${myTutorInfo.tutorId}`}
                </div>
                <div className="tutor-dept">
                  Khoa: {myTutorInfo.faculty || "Khoa học và Kỹ thuật máy tính"}
                </div>
              </div>
            </div>
        ) : (
            <div style={{ color: "orange", padding: "10px", border: "1px dashed orange", borderRadius: "8px" }}>
                ⚠️ Bạn chưa có Tutor nào được duyệt. Hãy đăng ký Tutor trước.
            </div>
        )}
      </div>

      {/* --- TAB: LIST --- */}
      {activeTab === "list" && (
        <div className="booking-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
            <h3 className="card-section-title" style={{ border: "none", margin: 0, padding: 0 }}>
              {isCancelMode ? "Chọn buổi gặp mặt để hủy" : "Buổi gặp mặt của tôi"}
            </h3>
            <button
              className={`btn-mode-switch ${isCancelMode ? "btn-back-mode" : "btn-cancel-mode"}`}
              onClick={handleToggleCancelMode}
            >
              {isCancelMode ? "← Quay lại danh sách" : "Hủy đăng ký"}
            </button>
          </div>
          <div className="booking-body">{renderMeetingList()}</div>
        </div>
      )}

      {/* --- TAB: BOOK --- */}
      {activeTab === "book" && (
        <div className="booking-card">
          <h3 className="card-section-title">Đặt lịch hẹn</h3>
          
          {!currentTutorId ? (
             <div className="booking-body">
                <p style={{color: 'red'}}>Chức năng này bị khóa vì bạn chưa có Tutor.</p>
             </div>
          ) : (
             <div className="booking-body">
                <div className="calendar-section">
                  <Calendar
                    activeDate={toLocalDateString(date)}
                    onSelect={handleCustomCalendarSelect}
                    availableDates={availableDatesList}
                  />
                  {slotsError && <p className="error-text">{slotsError}</p>}
                </div>
                <div className="booking-right">
                  <form className="booking-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label>Ngày đã chọn</label>
                      <input type="date" className="form-input" value={formatDateForInput(date)} readOnly />
                    </div>
                    <div className="form-group">
                      <label>Khung giờ rảnh</label>
                      <select
                        className="form-input"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        disabled={loadingSlots || !availableRanges.length}
                      >
                        {loadingSlots && <option>Đang tải...</option>}
                        {!loadingSlots && !availableRanges.length && <option value="">Không có giờ rảnh</option>}
                        {!loadingSlots &&
                          availableRanges.map((r, i) => (
                            <option key={i} value={`${r.startTime.slice(0, 5)} - ${r.endTime.slice(0, 5)}`}>
                              {`${r.startTime.slice(0, 5)} - ${r.endTime.slice(0, 5)}`}
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
                          onChange={(e) => setPreferredStart(e.target.value)}
                        />
                        <span style={{ alignSelf: "center" }}>-</span>
                        <input
                          type="time"
                          className="form-input"
                          value={preferredEnd}
                          onChange={(e) => setPreferredEnd(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Nội dung</label>
                      <input
                        type="text"
                        className="form-input"
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
          )}
        </div>
      )}

      {/* --- TAB: CONSULT --- */}
      {activeTab === "consult" && (
        <div className="booking-card">
          <h3 className="card-section-title">Đăng kí buổi tư vấn</h3>
          <div className="booking-body">
            <p>Chức năng đang phát triển...</p>
          </div>
        </div>
      )}

      {/* --- MODAL --- */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={handleCloseCancelModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Xác nhận hủy đăng ký</div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn hủy không? Vui lòng nhập lý do:</p>
              <textarea
                value={cancelReasonInput}
                onChange={(e) => setCancelReasonInput(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="btn-modal-close" onClick={handleCloseCancelModal}>
                Đóng
              </button>
              <button className="btn-modal-confirm" onClick={handleConfirmCancel}>
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