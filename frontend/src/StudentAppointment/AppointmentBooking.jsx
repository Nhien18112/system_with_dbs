// src/AppointmentBooking.jsx
import "./AppointmentBooking.css";
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  bookAppointment,
  getTutorFreeSlots,
  getStudentAppointments,
  cancelAppointment,
} from "../service/studentService";
import StudentLayout from "../StudentLayout";


function AppointmentBooking({ studentId = 1, tutorId = 1 }) {
  // --------- STATE CƠ BẢN ----------
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(""); // "HH:mm - HH:mm"
  // Giờ mong muốn của student (trong khung giờ rảnh)
  const [preferredStart, setPreferredStart] = useState(""); // "HH:mm"
  const [preferredEnd, setPreferredEnd] = useState("");     // "HH:mm"

  const [topic, setTopic] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState("");

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
  
    // --------- LẤY DANH SÁCH LỊCH HẸN TỪ BACKEND ----------
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
    loadAppointments();
  }, [studentId]);


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

  // Chuyển Date -> "YYYY-MM-DD"
  const dateKey = toLocalDateString(date); // vd: "2025-12-01"
    // Lấy slot hiện đang chọn từ availableRanges
  const selectedSlot = availableRanges.find((range) => {
    const startLabel = range.startTime.slice(0, 5); // "HH:mm"
    const endLabel = range.endTime.slice(0, 5);     // "HH:mm"
    const label = `${startLabel} - ${endLabel}`;
    return label === time;
  });

  // Helper chuyển "HH:mm" -> minutes
  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };

  if (selectedSlot) {
    const slotStart = toMinutes(selectedSlot.startTime.slice(0, 5));
    const slotEnd = toMinutes(selectedSlot.endTime.slice(0, 5));
    const prefStart = toMinutes(preferredStart);
    const prefEnd = toMinutes(preferredEnd);

    if (prefStart < slotStart || prefEnd > slotEnd || prefEnd <= prefStart) {
      setErrorMsg(
        "Giờ mong muốn phải nằm trong khung giờ rảnh của tutor và thời gian kết thúc phải lớn hơn thời gian bắt đầu."
      );
      return;
    }
  }

  // Chuỗi thời gian gửi lên backend: dùng giờ mong muốn của student
  const studentTimeRange = `${preferredStart} - ${preferredEnd}`;

  try {
    await bookAppointment({
      studentId: studentId || 1,  // có props thì dùng, không thì mock 1
      tutorId: tutorId || 1,
      dateKey,
      timeRange: studentTimeRange,            // "07:00 - 09:00"
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
  const renderAppointmentList = () => {
  if (appointmentsLoading) {
    return <p>Đang tải danh sách lịch hẹn...</p>;
  }
  if (appointmentsError) {
    return <p className="error-text">{appointmentsError}</p>;
  }
  if (!appointments.length) {
    return <p>Hiện chưa có lịch hẹn nào.</p>;
  }

  return (
    <div className="appointment-list">
      {appointments.map((appt) => {
        const status = (
          appt.appointmentStatus ||
          appt.status ||
          "PENDING"
        ).toUpperCase();

        const startIso = appt.startTime || appt.date;
        const endIso = appt.endTime;
        let dateLabel = "";
        let timeLabel = "";

        if (startIso) {
          const start = new Date(startIso);
          const end = endIso ? new Date(endIso) : null;
          dateLabel = start.toLocaleDateString("vi-VN");
          timeLabel = end
            ? `${start.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })} - ${end.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : start.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              });
        }

        const id = appt.meetingId;

        const rejectReason =appt.rejectReason || "";

        return (
          <div key={id} className="appointment-card">
            <div className="appointment-main">
              <div className="appointment-topic">{appt.topic}</div>
              <div className="appointment-meta">
                <span>{dateLabel}</span>
                <span>•</span>
                <span>{timeLabel}</span>
              </div>

              {status === "REJECTED" && rejectReason && (
              <div className="appointment-reason">
                Lý do từ chối: {rejectReason}
              </div>
            )}

            </div>

            <div className="appointment-actions">
              <span
                className={`status-badge status-${status.toLowerCase()}`}
              >
                {status}
              </span>
              {status === "PENDING" && (
                <button
                  type="button"
                  className="btn-cancel-appointment"
                  onClick={() => cancelAppointment(appt)}
                >
                  Hủy
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
  


    return (
    <StudentLayout activeMenu="meetings">
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
          <h3 className="card-section-title">Danh sách buổi gặp mặt</h3>
          <div className="booking-body">
            <p>Danh sách buổi gặp mặt sẽ được kết nối với API meetings sau.</p>
          </div>
        </div>
      )}

      {/* TAB: LỊCH HẸN */}
      {activeTab === "book" && (
        <>
          {/* CARD 1: Đặt lịch hẹn */}
          <div className="booking-card">
            <h3 className="card-section-title">Đặt lịch hẹn</h3>

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
                  {/* Ngày */}
                  <div className="form-group">
                    <label>Ngày</label>
                    <div className="form-input-wrapper">
                      <input
                        type="date"
                        className="form-input"
                        value={formatDateForInput(date)}
                        onChange={(e) => handleChangeDate(new Date(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Khung giờ rảnh của tutor */}
                  <div className="form-group">
                    <label>Khung giờ rảnh của tutor</label>
                    <div className="form-input-wrapper">
                      <select
                        className="form-input"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        disabled={loadingSlots || availableRanges.length === 0}
                      >
                        {loadingSlots && <option>Đang tải khung giờ...</option>}

                        {!loadingSlots && availableRanges.length === 0 && (
                          <option value="">Không có khung giờ rảnh</option>
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

                  {/* Giờ hẹn mong muốn */}
                  <div className="form-group">
                    <label>Giờ hẹn bạn mong muốn</label>
                    <div
                      className="form-input-wrapper"
                      style={{ display: "flex", gap: 8 }}
                    >
                      <input
                        type="time"
                        className="form-input"
                        value={preferredStart}
                        onChange={(e) => setPreferredStart(e.target.value)}
                        disabled={availableRanges.length === 0 || !time}
                      />
                      <span style={{ alignSelf: "center" }}>–</span>
                      <input
                        type="time"
                        className="form-input"
                        value={preferredEnd}
                        onChange={(e) => setPreferredEnd(e.target.value)}
                        disabled={availableRanges.length === 0 || !time}
                      />
                    </div>
                  </div>

                  {/* Nội dung */}
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

          {/* CARD 2: Lịch hẹn của tôi */}
          <div className="booking-card">
            <h3 className="card-section-title">Lịch hẹn của tôi</h3>
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
    </StudentLayout>
  );
}

export default AppointmentBooking;
