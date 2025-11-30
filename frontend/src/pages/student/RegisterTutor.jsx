import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterTutor.css';
import mockTutors from './mockDatabase';
import Vectorimg from '../../assets/Vector.png';
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
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [page, setPage] = useState(1);

  const subjects = [
    'Nguyên lý ngôn ngữ lập trình',
    'Cấu trúc dữ liệu',
    'Lập trình hướng đối tượng',
    'Cơ sở dữ liệu',
    'Mạng máy tính',
    'Hệ điều hành',
    'Trí tuệ nhân tạo'
  ];

  const onFindTutors = () => {
    // try to filter from the mock database by subject
    const subj = subject && subject.trim();
    let results = [];
    if (subj) {
      results = mockTutors.filter(t => Array.isArray(t.subjects) && t.subjects.some(s => s.toLowerCase().includes(subj.toLowerCase())));
    }
    // fallback to simple mock if none found
    if (!results || results.length === 0) {
      results = mockTutors; // Use all tutors from mock database
    }
    setTutors(results);
    setShowSubjectDropdown(false);
    setPage(1);
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

  // pagination helpers for step 2
  const pageSize = 3;
  const totalPages = Math.max(1, Math.ceil(tutors.length / pageSize));
  const visibleTutors = tutors.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="register-root">
      <div className="steps-header">
        <div className="back-area"><button className="back-link" onClick={() => { if (step>1) setStep(step-1); else navigate(-1); }}>« Quay lại</button></div>
      </div>

      <div className="steps-row">
        <div className="steps">
          <div className={`step ${step>=1? 'active':''}`}>
            <div className="circle">1</div>
            <small>Nhập thông tin</small>
          </div>
          <div className={`connector ${step>1? 'active':''}`} />
          <div className={`step ${step>=2? 'active':''}`}>
            <div className="circle">2</div>
            <small>Chọn tutor</small>
          </div>
          <div className={`connector ${step>2? 'active':''}`} />
          <div className={`step ${step>=3? 'active':''}`}>
            <div className="circle">3</div>
            <small>Xác nhận</small>
          </div>
        </div>
      </div>

      {step===1 && (
        <div className="card shifted">
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
        <div className="card shifted">
          <div className="tutor-grid-container">
            <div className="tutor-grid">
              {visibleTutors.map(t => (
                <div key={t.tutorId} className="background-border">
                  <div className="container">
                    <div className="link">
                      <div className="course" style={{ backgroundImage: `url(${t.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80'})` }} />
                    </div>
                    <div className="background">
                      <div className="text-wrapper">{t.code}</div>
                    </div>
                  </div>

                  <div className="symbol">★★★★★</div>
                  <div className="div">{t.rating}</div>

                  <div className="paragraph-background">
                    <div className="symbol-2"></div>
                    <div className="hk">{t.hk}</div>
                    <div className="symbol-3"></div>
                    <div className="text-wrapper-2">Students {t.students}</div>
                  </div>

                  <div className="image" style={{ backgroundImage: `url(${t.avatar})` }} />
                  <div className="text-wrapper-3">{t.name}</div>

                  <button className="link-2" onClick={() => onSelectTutor(t)}>
                    <div className="text-wrapper-4">Enroll</div>
                    <div className="SVG">
                      <div className="arrow">→</div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* pagination controls for tutor list */}
          {tutors.length > 0 && (
            <div className="pagination-controls">
              <div className="pagination-dots">
                {Array.from({length: totalPages}).map((_,i)=> (
                  <button 
                    key={i} 
                    className={`pagination-dot ${page===i+1? 'active':''}`} 
                    onClick={()=>setPage(i+1)}
                  >
                    {i+1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step===3 && (
  <div className="confirmation-container">
    <div className="confirmation-border">
      <div className="confirmation-background">
        <div className="confirmation-icon">
          <img className="vector-img" src={Vectorimg} alt="Success Icon" />
        </div>
        <div className="confirmation-border-dash" />
      </div>

      <div className="confirmation-heading">
        HỆ THỐNG XÁC NHẬN ĐĂNG KÝ THÀNH CÔNG
      </div>

      <div className="confirmation-content">
        <div className="course-title">
          {subject.toUpperCase()} ({selectedTutor?.code || tutors[0]?.code})
        </div>

        <div className="student-info">
          <div className="info-item"><strong>Sinh viên:</strong> Nguyễn Văn A</div>
          <div className="info-item"><strong>MSSV:</strong> 123456</div>
          <div className="info-item"><strong>Tutor:</strong> {selectedTutor?.name || (tutors[0] && tutors[0].name)}</div>
        </div>

        <div className="note-section">
          <div className="note-title">LƯU Ý</div>
          <div className="note-content">
            Yêu cầu sẽ ở trạng thái "Chờ duyệt" nếu Tutor cần xác nhận.
            <br />
            Hủy trước 12 giờ để không mất slot.
          </div>
        </div>

        <div className="confirmation-actions">
          <button className="btn-confirm" onClick={onConfirm}>Xác nhận</button>
        </div>
      </div>
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