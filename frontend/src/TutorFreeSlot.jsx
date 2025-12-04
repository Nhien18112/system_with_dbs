import React, { useState, useEffect } from "react";
import "./TutorFreeSlot.css";
import Calendar from "./Calendar";

const TutorFreeSlot = () => {
  // --- STATE ---
  const [viewMode, setViewMode] = useState("VIEW");

  // Khởi tạo ngày hiện tại (Local Time chuẩn)
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  const [dailySlots, setDailySlots] = useState([]);
  const [formSlots, setFormSlots] = useState([]);

  const AUTH_HEADER =
    "Basic " + btoa("user:93f1df6e-84d4-406d-98e0-a9ffd05e43da");

  // --- HANDLERS ---
  const handleCalendarSelect = (dateStr) => {
    // Calendar trả về string "YYYY-MM-DD"
    setSelectedDate(dateStr);
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hh = h.toString().padStart(2, "0");
        const mm = m.toString().padStart(2, "0");
        options.push(`${hh}:${mm}`);
      }
    }
    return options;
  };
  const timeOptions = generateTimeOptions();

  const fetchDailySlots = (date) => {
    fetch(`http://localhost:8081/freeslots/daily?date=${date}`, {
      headers: { Authorization: AUTH_HEADER },
    })
      .then((res) => res.json())
      .then((data) => {
        setDailySlots(data.timeRanges || []);
        setFormSlots(data.timeRanges || []);
      })
      .catch((err) => console.error("Lỗi:", err));
  };

  useEffect(() => {
    if (selectedDate) fetchDailySlots(selectedDate);
  }, [selectedDate]);

  const handleAddSlot = () => {
    setFormSlots([
      ...formSlots,
      { startTime: "07:00:00", endTime: "09:00:00" },
    ]);
  };

  const handleRemoveSlot = (index) => {
    const newSlots = [...formSlots];
    newSlots.splice(index, 1);
    setFormSlots(newSlots);
  };

  const handleChangeTime = (index, field, value) => {
    const newSlots = [...formSlots];
    newSlots[index][field] = value + ":00";
    setFormSlots(newSlots);
  };

  const handleSave = () => {
    const payload = { date: selectedDate, timeRanges: formSlots };

    fetch("http://localhost:8081/freeslots/daily", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_HEADER,
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (res.ok) {
          const warnings = await res.json();
          if (warnings && warnings.length > 0) {
            alert("Đã lưu thành công! Lưu ý:\n- " + warnings.join("\n- "));
          } else {
            alert("Đã lưu lịch thành công!");
          }
          setViewMode("VIEW");
          fetchDailySlots(selectedDate);
        } else {
          const errorMsg = await res.text();
          alert("Lỗi: " + errorMsg);
        }
      })
      .catch(() => alert("Không kết nối được Server!"));
  };

  // --- RENDER ---
  return (
    <div style={{ width: "100%", padding: "30px 40px 30px 40px" }}>
      <div className="top-tabs">
        <button className="tab-btn">Thông tin cá nhân</button>
        <button className="tab-btn active">Lịch rảnh</button>
      </div>

      <div className="main-card">
        {/* VIEW MODE */}
        {viewMode === "VIEW" && (
          <div className="view-mode-container">
            <div className="time-list-panel">
              <div className="time-list-header">≪ {selectedDate} ≫</div>
              <div className="time-list-body">
                {dailySlots.length === 0 ? (
                  <div className="time-slot-item">Chưa có lịch</div>
                ) : (
                  dailySlots.map((s, i) => (
                    <div key={i} className="time-slot-item">
                      {s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="calendar-panel">
              <button
                className="setup-btn"
                onClick={() => setViewMode("SETUP")}
              >
                Thiết lập lịch rảnh
              </button>

              <div style={{ marginTop: "15px" }}>
                <Calendar
                  activeDate={selectedDate}
                  onSelect={handleCalendarSelect}
                />
              </div>
            </div>
          </div>
        )}

        {/* SETUP MODE */}
        {viewMode === "SETUP" && (
          <div className="setup-mode-container">
            {/* Nút LƯU (Bay lên góc phải nhờ CSS position absolute) */}
            <div className="action-bar">
              <button className="save-btn" onClick={handleSave}>
                Lưu
              </button>
            </div>

            <h3 className="setup-title">Thiết lập lịch rảnh</h3>

            <div className="date-picker-row">
              Ngày:{" "}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="form-container">
              <button className="add-time-btn" onClick={handleAddSlot}>
                + Thêm thời gian
              </button>

              {formSlots.map((slot, i) => (
                <div key={i} className="time-row">
                  <div className="input-group">
                    <label>Bắt đầu</label>
                    <select
                      className="input-box"
                      value={slot.startTime.slice(0, 5)}
                      onChange={(e) =>
                        handleChangeTime(i, "startTime", e.target.value)
                      }
                    >
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Kết thúc</label>
                    <select
                      className="input-box"
                      value={slot.endTime.slice(0, 5)}
                      onChange={(e) =>
                        handleChangeTime(i, "endTime", e.target.value)
                      }
                    >
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Nút Xóa (Dấu X tròn) */}
                  <button
                    className="delete-btn"
                    onClick={() => handleRemoveSlot(i)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Nút HỦY (Chữ Hủy - Góc phải) */}
            <div
              className="action-footer"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "15px",
              }}
            >
              <button
                className="cancel-btn"
                onClick={() => {
                  setViewMode("VIEW");
                  fetchDailySlots(selectedDate);
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorFreeSlot;
