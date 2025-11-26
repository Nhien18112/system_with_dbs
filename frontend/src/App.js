/* src/App.js */
import React, { useState, useEffect } from 'react';
import './App.css'; // Import CSS

function App() {
  // --- STATE ---
  const [viewMode, setViewMode] = useState('VIEW'); // 'VIEW' or 'SETUP'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [dailySlots, setDailySlots] = useState([]);
  const [formSlots, setFormSlots] = useState([]);

  // --- API ---
  const fetchDailySlots = (date) => {
    fetch(`http://localhost:8080/freeslots/daily?date=${date}`)
      .then(res => res.json())
      .then(data => {
        const slots = data.timeRanges || [];
        setDailySlots(slots);
        setFormSlots(slots);
      })
      .catch(err => {
        console.error("Lỗi:", err);
        setDailySlots([]);
        setFormSlots([]);
      });
  };

  useEffect(() => {
    fetchDailySlots(selectedDate);
  }, [selectedDate]);

  // --- HANDLERS ---
  const handleAddSlot = () => setFormSlots([...formSlots, { startTime: "07:00", endTime: "09:00" }]);
  
  const handleRemoveSlot = (index) => {
    const newSlots = [...formSlots];
    newSlots.splice(index, 1);
    setFormSlots(newSlots);
  };

  const handleChangeTime = (index, field, value) => {
    const newSlots = [...formSlots];
    newSlots[index][field] = value.length === 5 ? value + ":00" : value;
    setFormSlots(newSlots);
  };

  const handleSave = () => {
    fetch('http://localhost:8080/freeslots/daily', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: selectedDate, timeRanges: formSlots })
    })
    .then(res => res.ok ? alert("Thành công!") : alert("Lỗi!"))
    .then(() => {
        setViewMode('VIEW');
        fetchDailySlots(selectedDate);
    });
  };

  // --- RENDER ---
  return (
    <div className="layout">
      <header className="header">
        <div className="brand">🎓 Tutor System</div>
        <div className="user-info"><div className="avatar-circle">B</div> Trần Văn B</div>
      </header>

      <div className="main-container">
        <div className="sidebar">
          <div className="menu-item">📅 Buổi gặp mặt</div>
          <div className="menu-item">📖 Khóa học</div>
          <div className="menu-item active">⚙️ Hồ sơ cá nhân</div>
        </div>

        <div className="content">
          <div className="tabs">
            <button className="tab-btn">Thông tin cá nhân</button>
            <button className="tab-btn active">Lịch rảnh</button>
          </div>

          <div className="card-panel">
            {viewMode === 'VIEW' ? (
              <div className="view-mode">
                <div className="time-list-col">
                  <div className="time-header">📅 {selectedDate}</div>
                  {dailySlots.map((slot, i) => (
                    <div key={i} className="time-item">{slot.startTime.slice(0,5)} - {slot.endTime.slice(0,5)}</div>
                  ))}
                  {dailySlots.length === 0 && <div style={{padding:20,textAlign:'center',color:'#999'}}>Trống</div>}
                </div>

                <div className="calendar-col">
                  <button className="btn-setup" onClick={() => setViewMode('SETUP')}>Thiết lập lịch rảnh</button>
                  <div className="cal-grid">
                    {['S','M','T','W','T','F','S'].map(d=><div key={d} style={{textAlign:'center',padding:5,background:'#f4f4f4'}}>{d}</div>)}
                    {[...Array(30)].map((_, i) => {
                       const day = (i+1).toString().padStart(2,'0');
                       const dStr = `2025-10-${day}`;
                       return (
                         <div key={i} className={`cal-cell ${selectedDate===dStr?'selected':''}`} onClick={()=>setSelectedDate(dStr)}>
                           {i+1}
                           {selectedDate===dStr && dailySlots.length>0 && <div className="dot"/>}
                         </div>
                       )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="setup-mode">
                <div className="setup-header">
                   <h3>Thiết lập lịch rảnh ({selectedDate})</h3>
                   <button className="btn-save" onClick={handleSave}>Lưu</button>
                </div>
                <div className="form-body">
                   <button onClick={handleAddSlot} style={{marginBottom:15}}>+ Thêm</button>
                   {formSlots.map((s, i) => (
                     <div key={i} className="time-row">
                       <input type="time" className="input-field" value={s.startTime.slice(0,5)} onChange={e=>handleChangeTime(i,'startTime',e.target.value)}/>
                       <span>đến</span>
                       <input type="time" className="input-field" value={s.endTime.slice(0,5)} onChange={e=>handleChangeTime(i,'endTime',e.target.value)}/>
                       <button className="btn-remove" onClick={()=>handleRemoveSlot(i)}>✕</button>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <footer className="footer"><div>#TUTOR SUPPORT SYSTEM</div></footer>
    </div>
  );
}

export default App;