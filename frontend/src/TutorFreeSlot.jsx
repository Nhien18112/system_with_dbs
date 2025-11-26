import React, { useState, useEffect } from 'react';
import './TutorFreeSlot.css';

const TutorFreeSlot = () => {
    // --- STATE ---
    const [viewMode, setViewMode] = useState('VIEW'); 
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    const [dailySlots, setDailySlots] = useState([]); 
    const [formSlots, setFormSlots] = useState([]);   

    // --- HÀM TẠO GIỜ 24H (00:00 -> 23:45) ---
    const generateTimeOptions = () => {
        const options = [];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 15) { 
                const hh = h.toString().padStart(2, '0');
                const mm = m.toString().padStart(2, '0');
                options.push(`${hh}:${mm}`);
            }
        }
        return options;
    };
    const timeOptions = generateTimeOptions();

    // --- API CALLS ---
    const fetchDailySlots = (date) => {
        fetch(`http://localhost:8080/freeslots/daily?date=${date}`, {
            headers: { 
                'Authorization': 'Basic ' + btoa('user:5a98730a-2c10-4dcd-9b5d-9ef524838cf3') // NHỚ THAY MẬT KHẨU MỚI TỪ LOG
            }
        })
        .then(res => res.json())
        .then(data => {
            setDailySlots(data.timeRanges || []);
            setFormSlots(data.timeRanges || []);
        })
        .catch(err => console.error("Lỗi:", err));
    };

    useEffect(() => {
        fetchDailySlots(selectedDate);
    }, [selectedDate]);

    // --- HANDLERS ---
    const handleAddSlot = () => {
        setFormSlots([...formSlots, { startTime: "07:00:00", endTime: "09:00:00" }]);
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

    // --- HÀM LƯU (CẬP NHẬT LOGIC MỚI) ---
    const handleSave = () => {
        const payload = { date: selectedDate, timeRanges: formSlots };

        fetch('http://localhost:8080/freeslots/daily', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa('user:5a98730a-2c10-4dcd-9b5d-9ef524838cf3') // NHỚ THAY MẬT KHẨU
            },
            body: JSON.stringify(payload)
        })
        .then(async (res) => {
            if (res.ok) {
                // Server trả về mảng các cảnh báo (List<String>)
                const warnings = await res.json();

                if (warnings && warnings.length > 0) {
                    // Nếu có cảnh báo -> Hiện lên
                    alert("Đã lưu thành công!\n- " + warnings.join("\n- "));
                } else {
                    // Không có cảnh báo -> Ngon lành
                    alert("Đã lưu lịch thành công!");
                }

                setViewMode('VIEW');
                fetchDailySlots(selectedDate);
            } else {
                // Lỗi Logic (Ví dụ Start > End) -> Hiện thông báo lỗi từ Server
                const errorMsg = await res.text();
                alert("Lỗi: " + errorMsg);
            }
        })
        .catch(() => alert("Không kết nối được Server!"));
    };

    // --- RENDER ---
    return (
        <div className="layout">
            {/* ... (Phần Header, Sidebar giữ nguyên như cũ) ... */}
            <header className="header">
                <div className="logo">🎓 TUTOR SYSTEM</div>
                <div className="header-right">🔔 👤 Trần Văn B</div>
            </header>

            <div className="container">
                <div className="sidebar">
                    <div className="sidebar-item">📅 Buổi gặp mặt</div>
                    <div className="sidebar-item">📖 Khóa học</div>
                    <div className="sidebar-item active">⚙️ Hồ sơ cá nhân</div>
                </div>

                <div className="content">
                    <div className="top-tabs">
                        <button className="tab-btn">Thông tin cá nhân</button>
                        <button className="tab-btn active">Lịch rảnh</button>
                    </div>

                    <div className="main-card">
                        {/* VIEW MODE */}
                        {viewMode === 'VIEW' && (
                            <div className="view-mode-container">
                                <div className="time-list-panel">
                                    <div className="time-list-header">≪ {selectedDate} ≫</div>
                                    <div className="time-list-body">
                                        {dailySlots.length === 0 ? 
                                            <div className="time-slot-item">Chưa có lịch</div> : 
                                            dailySlots.map((s, i) => (
                                                <div key={i} className="time-slot-item">
                                                    {s.startTime.slice(0,5)} - {s.endTime.slice(0,5)}
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                                <div className="calendar-panel">
                                    <button className="setup-btn" onClick={() => setViewMode('SETUP')}>
                                        Thiết lập lịch rảnh
                                    </button>
                                    <div className="calendar-grid">
                                        {[...Array(30)].map((_, i) => (
                                            <div key={i} 
                                                className={`cal-day ${i+1 === parseInt(selectedDate.split('-')[2]) ? 'selected' : ''}`}
                                                onClick={() => setSelectedDate(`2025-10-${(i+1).toString().padStart(2,'0')}`)}
                                            >
                                                {i + 1}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SETUP MODE */}
                        {viewMode === 'SETUP' && (
                            <div className="setup-mode-container">
                                <div className="action-bar">
                                    <button className="save-btn" onClick={handleSave}>Lưu</button>
                                </div>
                                <h3 className="setup-title">Thiết lập lịch rảnh</h3>
                                <div className="date-picker-row">
                                    Ngày: <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} />
                                </div>

                                <div className="form-container">
                                    <button className="add-time-btn" onClick={handleAddSlot}>+ Thêm thời gian</button>
                                    
                                    {formSlots.map((slot, i) => (
                                        <div key={i} className="time-row">
                                            <div className="input-group">
                                                <label>Bắt đầu</label>
                                                <select 
                                                    className="input-box" 
                                                    value={slot.startTime.slice(0,5)} 
                                                    onChange={e => handleChangeTime(i, 'startTime', e.target.value)}
                                                >
                                                    {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>

                                            <div className="input-group">
                                                <label>Kết thúc</label>
                                                <select 
                                                    className="input-box" 
                                                    value={slot.endTime.slice(0,5)} 
                                                    onChange={e => handleChangeTime(i, 'endTime', e.target.value)}
                                                >
                                                    {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>
                                            
                                            <button className="delete-btn" onClick={() => handleRemoveSlot(i)}>✕</button>
                                        </div>
                                    ))}
                                </div>
                                
                                <div style={{textAlign: 'right', marginTop: 20}}>
                                    <button className="delete-btn" style={{fontSize: 14, textDecoration: 'underline'}} 
                                            onClick={() => {setViewMode('VIEW'); fetchDailySlots(selectedDate);}}>
                                        Hủy bỏ thay đổi
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <footer className="footer">
                <div>#TUTOR SUPPORT SYSTEM</div>
            </footer>
        </div>
    );
};

export default TutorFreeSlot;