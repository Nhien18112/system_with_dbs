import React, { useState } from 'react';
import './App.css';

function TutorCard({ tutor, onSelect }) {
  const avatarImages = [
    'https://i.pravatar.cc/150?img=1',
    'https://i.pravatar.cc/150?img=2',
    'https://i.pravatar.cc/150?img=3',
    'https://i.pravatar.cc/150?img=4',
    'https://i.pravatar.cc/150?img=5'
  ];
  const avatarUrl = avatarImages[tutor.tutorId.charCodeAt(tutor.tutorId.length - 1) % avatarImages.length];

  return (
    <div className="tutor-card">
      <img src={avatarUrl} alt={tutor.name} className="tutor-avatar-img" />
      <div className="tutor-info">
        <div className="tutor-name">{tutor.name}</div>
        <div className="tutor-rating">★★★★★ {tutor.rating}</div>
        <div className="tutor-meta">
          <span>{tutor.availableSlots} slot còn trống</span>
        </div>
      </div>
      <div>
        <button className="btn btn-select" onClick={() => onSelect(tutor)}>Chọn</button>
      </div>
    </div>
  );
}

export default function RegisterTutor() {
  const [step, setStep] = useState(1);
  const [subject, setSubject] = useState('');
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  const subjects = [
    'Nguyên lý ngôn ngữ lập trình',
    'Cấu trúc dữ liệu',
    'Lập trình hướng đối tượng',
    'Cơ sở dữ liệu',
    'Mạng máy tính',
    'Hệ điều hành',
    'Trí tuệ nhân tạo'
  ];

  const mockSearch = (subj) => {
    // simple mock suggestions
    if (!subj || subj.trim() === '') return [];
    return [
      { tutorId: 'tutor-1', name: 'Nguyễn Văn A', subject: subj, rating: 4.8, availableSlots: 2 },
      { tutorId: 'tutor-2', name: 'Trần Thị B', subject: subj, rating: 4.6, availableSlots: 1 }
    ];
  };

  const onFindTutors = () => {
    const results = mockSearch(subject);
    setTutors(results);
    setShowSubjectDropdown(false);
    setStep(2);
  };

  const onSelectSubject = (subj) => {
    setSubject(subj);
    setShowSubjectDropdown(false);
  };

  const onSelectTutor = (tutor) => {
    setSelectedTutor(tutor);
    setStep(3);
  };

  const onConfirm = () => {
    // call backend endpoint if needed. For now mock success and go to final
    setStep(4);
  };

  return (
    <div className="register-root">
      <div className="wizard">
        <div className={`step ${step>=1? 'active':''}`}><div>1</div><small>Nhập thông tin</small></div>
        <div className={`step ${step>=2? 'active':''}`}><div>2</div><small>Chọn tutor</small></div>
        <div className={`step ${step>=3? 'active':''}`}><div>3</div><small>Xác nhận</small></div>
      </div>

      {step===1 && (
        <div className="card">
          <h3>Đăng ký Tutor</h3>
          <label>Chọn môn / lĩnh vực</label>
          <div className="subject-row" style={{ position: 'relative' }}>
            <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Ví dụ: Nguyên lý ngôn ngữ lập trình" />
            <button className="icon-arrow" title="Chọn môn" onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}>▼</button>
            {showSubjectDropdown && (
              <div className="subject-dropdown">
                {subjects.map(s => (
                  <div key={s} className="dropdown-item" onClick={() => onSelectSubject(s)}>
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="actions">
            <button className="btn btn-primary" onClick={onFindTutors}>Tiếp theo</button>
          </div>
        </div>
      )}

      {step===2 && (
        <div className="card">
          <h3>Tutor phù hợp</h3>
          <div className="tutor-list">
            {tutors.map(t => <TutorCard key={t.tutorId} tutor={t} onSelect={onSelectTutor} />)}
          </div>
          <div className="actions">
            <button className="btn" onClick={()=>setStep(1)}>Quay lại</button>
            <button className="btn btn-primary" onClick={()=>{ if (tutors.length>0) setStep(3); else setStep(1); }}>Tiếp theo</button>
          </div>
        </div>
      )}

      {step===3 && (
        <div className="card">
          <div className="confirm-box-wrapper">
            <div className="confirm-box">
              <p><strong>Học viên:</strong> s123</p>
              <p><strong>Môn:</strong> {subject}</p>
              <p><strong>Tutor:</strong> {selectedTutor?.name || (tutors[0] && tutors[0].name)}</p>
              <p className="note">Yêu cầu sẽ ở trạng thái Chờ duyệt trong 12 giờ.</p>
              <button className="btn btn-danger" onClick={()=>{ setStep(1); setSubject(''); setTutors([]); setSelectedTutor(null); }}>Quay lại</button>
            </div>
          </div>
          <div className="actions" style={{justifyContent: 'center', marginTop: '24px'}}>
            <button className="btn" onClick={()=>setStep(2)}>Quay lại</button>
            <button className="btn btn-primary" onClick={onConfirm}>Xác nhận</button>
          </div>
        </div>
      )}

      {step===4 && (
        <div className="card success">
          <div className="success-icon">✓</div>
          <h3>Đăng ký thành công</h3>
          <p>Yêu cầu của bạn đã được lưu và đang chờ duyệt.</p>
          <div className="actions">
            <button className="btn btn-primary" onClick={()=>{ setStep(1); setSubject(''); setTutors([]); setSelectedTutor(null); }}>Đăng ký mới</button>
          </div>
        </div>
      )}
    </div>
  );
}
