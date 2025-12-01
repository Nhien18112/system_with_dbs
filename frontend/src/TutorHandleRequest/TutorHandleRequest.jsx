// src/TutorHandleRequest.jsx
import React, { useEffect, useState } from "react";
import "./TutorHandleRequest.css";

import {
  getPendingAppointments,
  approveAppointment,
  rejectAppointment,
} from "../service/tutorService";

const TUTOR_ID_DEFAULT = 1;

// --- HELPERS ---
const formatDateDisplay = (dateTimeStr) => {
  if (!dateTimeStr) return "";
  const dateObj = new Date(dateTimeStr);
  if (isNaN(dateObj.getTime())) return dateTimeStr; 
  return dateObj.toLocaleDateString("vi-VN"); 
};

const formatTimeDisplay = (dateTimeStr) => {
  if (!dateTimeStr) return "";
  if (dateTimeStr.length <= 8) return dateTimeStr.slice(0, 5);
  const dateObj = new Date(dateTimeStr);
  if (isNaN(dateObj.getTime())) return "";
  return dateObj.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
};

const formatRangeForList = (appt) => {
  if (!appt) return { dateLabel: "", timeLabel: "" };
  const dateSource = appt.startTime || appt.date;
  const dateLabel = formatDateDisplay(dateSource);
  const start = formatTimeDisplay(appt.startTime);
  const end = formatTimeDisplay(appt.endTime);
  return { dateLabel, timeLabel: `${start} - ${end}` };
};

function TutorHandleRequest({ tutorId = TUTOR_ID_DEFAULT }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [selected, setSelected] = useState(null); 
  const [statusMsg, setStatusMsg] = useState("");

  // Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [returnSlot, setReturnSlot] = useState("no"); 

  // ----------------- Load -----------------
  const loadPending = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await getPendingAppointments(tutorId || TUTOR_ID_DEFAULT);
      if (Array.isArray(data)) {
        const onlyPending = data.filter(appt => 
            (appt.appointmentStatus || appt.status) === 'PENDING'
        );
        setAppointments(onlyPending);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error("Load error:", err);
      setErrorMsg("Không tải được danh sách yêu cầu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPending(); }, [tutorId]);

  // ----------------- Actions -----------------
  const handleViewDetail = (appt) => {
    setSelected(appt);
    setStatusMsg("");
  };

  const handleBack = () => {
    setSelected(null);
    setStatusMsg("");
    loadPending();
  };

  const handleApprove = async () => {
    if (!selected) return;
    if (!window.confirm("Bạn có chắc chắn muốn PHÊ DUYỆT yêu cầu này?")) return;
    try {
      setStatusMsg("Đang xử lý...");
      await approveAppointment(selected.meetingId, tutorId || TUTOR_ID_DEFAULT);
      alert("Đã phê duyệt thành công!");
      handleBack(); 
    } catch (err) {
      const msg = err.response?.data || "Lỗi khi phê duyệt.";
      setStatusMsg(`Lỗi: ${msg}`);
    }
  };


  const handleOpenRejectModal = () => {
    setRejectReason("");
    setReturnSlot("no");
    setShowRejectModal(true);
  }


  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
  }


  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối.");
      return;
    }
    
    try {
      await rejectAppointment(selected.meetingId, tutorId || TUTOR_ID_DEFAULT, rejectReason.trim());
      if (returnSlot === "yes") {
         console.log("Returning slot...");
      }
      alert("Đã từ chối yêu cầu.");
      handleCloseRejectModal();
      handleBack();
    } catch (err) {
      const msg = err.response?.data || "Lỗi khi từ chối.";
      alert(msg); 
    }
  };

  // ----------------- Render List -----------------
  const renderList = () => (
    <div className="booking-card">
      <h3 className="card-section-title">Danh sách yêu cầu chờ duyệt</h3>
      <div className="booking-body">
        {loading && <p>Đang tải dữ liệu...</p>}
        {errorMsg && <p className="error-text">{errorMsg}</p>}
        {!loading && !errorMsg && !appointments.length && (
          <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
            Hiện không có yêu cầu nào đang chờ duyệt.
          </div>
        )}
        {!loading && appointments.map((appt) => {
            const { dateLabel, timeLabel } = formatRangeForList(appt);
            return (
              <div key={appt.meetingId} className="appointment-card">
                <div className="appointment-main">
                  <div className="appointment-topic">{appt.topic || "Không có tiêu đề"}</div>
                  <div className="appointment-meta">
                    <span className="meta-icon">Ngày: </span> {dateLabel}
                    <span className="meta-separator">•</span>
                    <span className="meta-icon">Khung giờ: </span> {timeLabel}
                  </div>
                  <div className="appointment-sub-meta">
                  </div>
                </div>
                <div className="appointment-actions">
                  <span className="status-badge status-pending">PENDING</span>
                  <button className="primary-btn-outline" onClick={() => handleViewDetail(appt)}>
                    Xem chi tiết
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );

  // ----------------- Render Detail -----------------
  const renderDetail = () => {
    if (!selected) return null;
    const { dateLabel, timeLabel } = formatRangeForList(selected);

    return (
      <div className="booking-card">
        <div className="detail-header">
            <button className="btn-back-icon" onClick={handleBack}>←</button>
            <h3 className="card-section-title" style={{marginBottom:0, border: 'none'}}>
                Chi tiết yêu cầu #{selected.meetingId}
            </h3>
        </div>
        <hr className="divider-light"/>

        <div className="tutor-request-grid">
          {/* Thông tin chính */}
          <div className="info-group">
              <div className="tutor-request-row">
                <div className="tutor-request-label">Họ tên sinh viên</div>
                <div className="tutor-request-value highlight-text">Sinh viên ID: {selected.studentId}</div>
              </div>
              <div className="tutor-request-row">
                <div className="tutor-request-label">Nội dung buổi hẹn</div>
                <div className="tutor-request-value main-topic">{selected.topic || "(Không có nội dung)"}</div>
              </div>
          </div>

          <div className="info-group two-col">
              <div className="tutor-request-row">
                <div className="tutor-request-label">Ngày diễn ra</div>
                <div className="tutor-request-value">{dateLabel}</div>
              </div>
              <div className="tutor-request-row">
                <div className="tutor-request-label">Khung giờ</div>
                <div className="tutor-request-value">{timeLabel}</div>
              </div>
          </div>

          {statusMsg && (
            <div className={`status-message ${statusMsg.includes("Lỗi") ? "msg-error" : "msg-success"}`}>
                {statusMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="tutor-request-actions">
            <button type="button" className="btn-secondary-outline" onClick={handleBack}>
              ← Quay lại
            </button>
            <div style={{display:'flex', gap:'10px'}}>
                {}
                <button type="button" className="btn-danger-outline" onClick={handleOpenRejectModal}>
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

  return (
    <div className="tutor-page">
      <div className="tutor-tabs">
        <button className="tab-btn">Danh sách buổi gặp mặt</button>
        <button className="tab-btn">Tạo buổi tư vấn</button>
        <button className="tab-btn tab-btn-active">Xử lí yêu cầu lịch hẹn</button>
      </div>
      {!selected ? renderList() : renderDetail()}

      {/* --- REJECT MODAL --- */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={handleCloseRejectModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Từ chối yêu cầu</div>
            <div className="modal-body">
              <div>
                <label className="modal-label">Lý do từ chối:</label>
                <textarea
                  className="tutor-reject-textarea"
                  placeholder="Nhập lý do..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  autoFocus
                />
              </div>
              
              <div>
                <label className="modal-label">Bạn có muốn trả lại slot này thành slot rảnh?</label>
                <div className="tutor-return-slot-options">
                  <label className="radio-option">
                    <input type="radio" name="returnSlot" value="yes"
                      checked={returnSlot === "yes"}
                      onChange={(e) => setReturnSlot(e.target.value)}
                    /> Có.
                  </label>
                  <label className="radio-option">
                    <input type="radio" name="returnSlot" value="no"
                      checked={returnSlot === "no"}
                      onChange={(e) => setReturnSlot(e.target.value)}
                    /> Không.
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-modal-close" onClick={handleCloseRejectModal}>Đóng</button>
              <button className="btn-modal-confirm-reject" onClick={handleConfirmReject}>Xác nhận từ chối</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TutorHandleRequest;