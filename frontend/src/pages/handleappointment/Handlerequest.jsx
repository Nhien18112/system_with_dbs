import React, { useState, useEffect } from "react";
import "./Handlerequest.css";

const Handlerequest = () => {
  const [activeTab, setActiveTab] = useState("process");
  const [selectedRequest, setSelectedRequest] = useState(null);

  // State API Data
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = "http://localhost:8080/api/tutor/scheduling";
  const TUTOR_ID = 1; // ID tutor co dinh

  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString("vi-VN");
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/appointments/pending?tutorId=${TUTOR_ID}`
      );
      if (!response.ok) throw new Error("Không thể kết nối server");

      const data = await response.json();

      // Map data
      const mappedData = data.map((item) => ({
        id: item.meetingId,
        topic: item.topic,
        sender: item.studentId,
        date: formatDate(item.startTime),
        startTime: formatTime(item.startTime),
        endTime: formatTime(item.endTime),
        onlineLink: item.onlineLink || "(Chưa có link)",
        fullData: item,
      }));
      setRequests(mappedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "process") {
      fetchAppointments();
    }
  }, [activeTab]);

  //Dong y
  const handleApproveAction = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn phê duyệt lịch hẹn này?"))
      return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/appointments/${selectedRequest.id}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tutorId: TUTOR_ID,
          }),
        }
      );

      if (response.ok) {
        alert("Phê duyệt thành công!");
        setRequests((prev) =>
          prev.filter((req) => req.id !== selectedRequest.id)
        );
        setSelectedRequest(null);
      } else {
        const msg = await response.text();
        alert("Lỗi từ server: " + msg);
      }
    } catch (err) {
      alert("Lỗi kết nối: " + err.message);
    }
  };

  //Tu choi
  const handleRejectAction = async () => {
    const reason = window.prompt("Vui lòng nhập lý do từ chối:");

    if (reason === null) return;
    if (reason.trim() === "") {
      alert("Lý do từ chối không được để trống!");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/appointments/${selectedRequest.id}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tutorId: TUTOR_ID,
            reason: reason,
          }),
        }
      );

      if (response.ok) {
        alert("Đã từ chối lịch hẹn!");

        setRequests((prev) =>
          prev.filter((req) => req.id !== selectedRequest.id)
        );
        setSelectedRequest(null);
      } else {
        const msg = await response.text();
        alert("Lỗi từ server: " + msg);
      }
    } catch (err) {
      alert("Lỗi kết nối: " + err.message);
    }
  };

  const handleBack = () => setSelectedRequest(null);
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedRequest(null);
  };

  const renderPlaceholder = (title) => (
    <div className="animate-fade-in">
      <h2 className="card-title">{title}</h2>
      <div className="divider"></div>
      <p className="placeholder-text">
        Tab {title.toLowerCase()} sẽ được triển khai sau.
      </p>
    </div>
  );

  const renderListView = () => {
    if (loading) return <div className="loading-text">Đang tải dữ liệu...</div>;
    if (error) return <div className="error-text">Lỗi: {error}</div>;
    if (requests.length === 0)
      return (
        <div className="empty-text">Không có yêu cầu nào đang chờ xử lý.</div>
      );

    return (
      <div className="animate-fade-in">
        <h2 className="card-title">Danh sách yêu cầu đặt lịch hẹn</h2>
        <div className="request-list">
          {requests.map((req) => (
            <div key={req.id} className="request-item">
              <div className="item-content">
                <div className="item-title">Chủ đề: {req.topic}</div>
                <div className="item-sub">
                  {req.date} | {req.startTime} - {req.endTime} từ sinh viên ID:{" "}
                  <strong>{req.sender}</strong>
                </div>
              </div>
              <button
                className="btn-primary btn-sm"
                onClick={() => setSelectedRequest(req)}
              >
                Xem chi tiết
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDetailView = () => (
    <div className="detail-form animate-fade-in">
      <div className="back-nav">
        <button className="btn-back" onClick={handleBack}>
          ← Quay lại danh sách
        </button>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Sinh viên (ID)</label>
          <div className="input-with-action">
            <input
              type="text"
              className="form-input read-only"
              value={selectedRequest.sender}
              readOnly
            />
            <button className="btn-primary btn-sm">Xem thông tin</button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Chủ đề</label>
          <textarea
            className="form-input read-only textarea-fixed"
            value={selectedRequest.topic}
            readOnly
          />
        </div>

        <div className="form-group">
          <label className="form-label">Thời gian</label>
          <div className="time-group">
            <div className="icon-input-wrapper date-field">
              <input
                type="text"
                className="form-input read-only"
                value={selectedRequest.date}
                readOnly
              />
              <span className="input-icon">📅</span>
            </div>
            <div className="time-field">
              <input
                type="text"
                className="form-input read-only"
                value={selectedRequest.startTime}
                readOnly
              />
            </div>
            <div className="time-field">
              <input
                type="text"
                className="form-input read-only"
                value={selectedRequest.endTime}
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Link Online</label>
          <input
            type="text"
            className="form-input read-only link-style"
            value={selectedRequest.onlineLink}
            readOnly
          />
        </div>
      </div>

      <div className="form-actions">
        <button className="btn-action btn-reject" onClick={handleRejectAction}>
          Từ chối
        </button>

        <button
          className="btn-action btn-approve"
          onClick={handleApproveAction}
        >
          Phê duyệt
        </button>
      </div>
    </div>
  );

  return (
    <div className="schedule-wrapper">
      <div className="schedule-container">
        <nav className="top-nav">
          <button
            className={`nav-btn ${activeTab === "list" ? "active" : ""}`}
            onClick={() => handleTabChange("list")}
          >
            Danh sách buổi gặp mặt
          </button>
          <button
            className={`nav-btn ${activeTab === "create" ? "active" : ""}`}
            onClick={() => handleTabChange("create")}
          >
            Tạo buổi tư vấn
          </button>
          <button
            className={`nav-btn ${activeTab === "process" ? "active" : ""}`}
            onClick={() => handleTabChange("process")}
          >
            Xử lí yêu cầu lịch hẹn
          </button>
        </nav>

        <main className="main-card-handle">
          {activeTab === "list" && renderPlaceholder("Danh sách buổi gặp mặt")}
          {activeTab === "create" && renderPlaceholder("Đăng kí buổi tư vấn")}
          {activeTab === "process" &&
            (selectedRequest ? renderDetailView() : renderListView())}
        </main>
      </div>
    </div>
  );
};

export default Handlerequest;
