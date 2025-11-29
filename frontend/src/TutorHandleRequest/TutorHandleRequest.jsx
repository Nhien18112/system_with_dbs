// src/TutorHandleRequest.jsx
import React, { useEffect, useState } from "react";
import "./TutorHandleRequest.css";

import {
  getPendingAppointments,
  approveAppointment,
  rejectAppointment,
} from "../service/tutorService";

const TUTOR_ID_DEFAULT = 1;

// Helper: backend gửi date = "2025-11-30"
const formatDateOnly = (dateStr) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

// Helper: "HH:mm:ss" -> "HH:mm"
const formatTimeOnly = (timeStr) => (timeStr ? timeStr.slice(0, 5) : "");

const formatRangeForList = (appt) => {
  if (!appt) return { dateLabel: "", timeLabel: "" };
  const dateLabel = formatDateOnly(appt.date);
  const start = formatTimeOnly(appt.startTime);
  const end = formatTimeOnly(appt.endTime);
  return {
    dateLabel,
    timeLabel: `${start} - ${end}`,
  };
};

function TutorHandleRequest({ tutorId = TUTOR_ID_DEFAULT }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [selected, setSelected] = useState(null); 
  const [rejectReason, setRejectReason] = useState("");
  const [returnSlot, setReturnSlot] = useState("no"); 
  const [statusMsg, setStatusMsg] = useState("");

  // ----------------- Load pending list -----------------
  const loadPending = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await getPendingAppointments(tutorId || TUTOR_ID_DEFAULT);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load pending appointments error:", err);
      setErrorMsg("Không tải được danh sách yêu cầu lịch hẹn.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, [tutorId]);

  // ----------------- Actions -----------------
  const handleViewDetail = (appt) => {
    setSelected(appt);
    setRejectReason("");
    setReturnSlot("no");
    setStatusMsg("");
  };

  const handleBack = () => {
    setSelected(null);
    setRejectReason("");
    setReturnSlot("no");
    setStatusMsg("");
    loadPending(); // Refresh list khi quay lại
  };

  const handleApprove = async () => {
    if (!selected) return;
    try {
      setStatusMsg("");
      await approveAppointment(selected.meetingId, tutorId || TUTOR_ID_DEFAULT);
      alert("Phê duyệt lịch hẹn thành công!"); // Dùng alert cho chắc chắn
      handleBack(); 
    } catch (err) {
      console.error("Approve error:", err);
      const status = err.response?.status;
      const msg = err.response?.data || "Lỗi khi phê duyệt.";
      setStatusMsg(`Lỗi (status ${status}): ${msg}`);
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    if (!rejectReason.trim()) {
      setStatusMsg("Vui lòng nhập lý do từ chối.");
      return;
    }

    try {
      setStatusMsg("");
      const shouldReturnSlot = returnSlot === "yes";
      await rejectAppointment(
        selected.meetingId,
        tutorId || TUTOR_ID_DEFAULT,
        rejectReason.trim(),
        shouldReturnSlot
      );
      
      alert(`Đã từ chối lịch hẹn${shouldReturnSlot ? " và trả lại slot rảnh" : ""}.`);
      handleBack();
    } catch (err) {
      console.error("Reject error:", err);
      const status = err.response?.status;
      const msg = err.response?.data || "Lỗi khi từ chối.";
      setStatusMsg(`Lỗi (status ${status}): ${msg}`);
    }
  };

  // ----------------- Render list card -----------------
  const renderList = () => (
    <div className="booking-card">
      <h3 className="card-section-title">Danh sách yêu cầu đặt lịch hẹn</h3>

      <div className="booking-body">
        {loading && <p>Đang tải...</p>}
        {errorMsg && <p className="error-text">{errorMsg}</p>}

        {!loading && !errorMsg && !appointments.length && (
          <p>Hiện chưa có yêu cầu lịch hẹn nào.</p>
        )}

        {!loading &&
          !errorMsg &&
          appointments.map((appt) => {
            const { dateLabel, timeLabel } = formatRangeForList(appt);
            return (
              <div key={appt.meetingId} className="appointment-card">
                <div className="appointment-main">
                  <div className="appointment-topic">{appt.topic}</div>
                  <div className="appointment-meta">
                    <span>{dateLabel}</span>
                    <span> • </span>
                    <span>{timeLabel}</span>
                    <span> • </span>
                    <span style={{fontWeight: 500, color: '#003366'}}>SV ID: {appt.studentId}</span>
                  </div>
                </div>

                <div className="appointment-actions">
                  <span className="status-badge status-pending">
                    {(appt.appointmentStatus || "PENDING").toUpperCase()}
                  </span>
                  <button
                    type="button"
                    className="primary-btn-outline"
                    onClick={() => handleViewDetail(appt)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );

  // ----------------- Render detail card -----------------
  const renderDetail = () => {
    if (!selected) return null;
    const { dateLabel, timeLabel } = formatRangeForList(selected);

    return (
      <div className="booking-card">
        <h3 className="card-section-title">Xử lí yêu cầu # {selected.meetingId}</h3>

        <div className="tutor-request-grid">
          {/* Thông tin chi tiết */}
          <div className="tutor-request-row">
            <div className="tutor-request-label">Họ tên sinh viên</div>
            <div className="tutor-request-value">Sinh viên ID: {selected.studentId}</div>
          </div>

          <div className="tutor-request-row">
            <div className="tutor-request-label">Nội dung</div>
            <div className="tutor-request-value">{selected.topic || ""}</div>
          </div>

          <div className="tutor-request-row">
            <div className="tutor-request-label">Ngày</div>
            <div className="tutor-request-value">{dateLabel}</div>
          </div>

          <div className="tutor-request-row">
            <div className="tutor-request-label">Thời gian</div>
            <div className="tutor-request-value">{timeLabel}</div>
          </div>

          <div className="tutor-request-row">
            <div className="tutor-request-label">Hình thức</div>
            <div className="tutor-request-value">{selected.meetingType || "APPOINTMENT"}</div>
          </div>

          {/* Form từ chối */}
          <div className="tutor-reject-section">
            <div className="tutor-request-label" style={{color: '#b91c1c'}}>Khu vực Từ chối (Nếu cần)</div>
            <textarea
              className="tutor-reject-textarea"
              placeholder="Nhập lý do từ chối tại đây..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <div className="tutor-return-slot">
              <div className="tutor-request-label" style={{fontSize: '13px', fontWeight: 500}}>
                Sau khi từ chối, bạn có muốn trả lại slot này thành slot rảnh không?
              </div>
              <div className="tutor-return-slot-options">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="returnSlot"
                    value="yes"
                    checked={returnSlot === "yes"}
                    onChange={(e) => setReturnSlot(e.target.value)}
                  />
                  Có, trả lại slot
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="returnSlot"
                    value="no"
                    checked={returnSlot === "no"}
                    onChange={(e) => setReturnSlot(e.target.value)}
                  />
                  Không (Giữ bận)
                </label>
              </div>
            </div>
          </div>

          {statusMsg && <p className={statusMsg.includes("Lỗi") ? "error-text" : "success-text"}>{statusMsg}</p>}

          <div className="tutor-request-actions">
            <button type="button" className="btn-secondary-outline" onClick={handleBack}>
              ← Quay lại
            </button>

            <div className="tutor-request-actions-right">
              <button type="button" className="btn-danger-outline" onClick={handleReject}>
                Từ chối
              </button>
              <button type="button" className="btn-primary" onClick={handleApprove}>
                Phê duyệt
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ----------------- Page -----------------
  return (
    <div className="tutor-page">
      {/* Tabs */}
      <div className="tutor-tabs">
        <button className="tab-btn">Danh sách buổi gặp mặt</button>
        <button className="tab-btn">Tạo buổi tư vấn</button>
        <button className="tab-btn tab-btn-active">Xử lí yêu cầu lịch hẹn</button>
      </div>

      {/* Content */}
      {!selected ? renderList() : renderDetail()}
    </div>
  );
}

export default TutorHandleRequest;