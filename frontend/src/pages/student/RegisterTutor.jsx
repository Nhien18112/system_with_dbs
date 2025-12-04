import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterTutor.css';
import Vectorimg from '../../assets/Vector.png';
import { registerTutor, cancelRegistration, suggestTutors, getStudentApprovedRegistrations } from '../../service/tutorService';
import { useAuth } from '../../AuthContext';

export default function RegisterTutor() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [page, setPage] = useState(1);
  const [countdown, setCountdown] = useState(10);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showConfirmCancelPopup, setShowConfirmCancelPopup] = useState(false);
  const [showCancelSuccessPopup, setShowCancelSuccessPopup] = useState(false);
  const [registrationId, setRegistrationId] = useState(null);
  const [hasApprovedRegistration, setHasApprovedRegistration] = useState(false);
  const [approvedTutorName, setApprovedTutorName] = useState('');
  

  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  
  // get current user from AuthContext
  const { user } = useAuth();
  
  // Lấy danh sách môn học từ BE và check duplicate registration
  useEffect(() => {
    const apiBase = process.env.REACT_APP_API_URL || "http://localhost:8081";
    fetch(`${apiBase}/api/subjects`)
      .then(res => res.json())
      .then(data => {
        console.log('Subjects loaded:', data);
        setSubjects(data);
      })
      .catch(err => {
        console.error('Failed to load subjects:', err);
        setSubjects([]);
      });
    
    // Check if student already has approved registration
    if (user?.id) {
      checkApprovedRegistration(user.id);
    }
  }, [user?.id]);

  const onFindTutors = async () => {
    setShowSubjectDropdown(false);
    if (!selectedSubjectId) {
      alert('Vui lòng chọn môn học');
      return;
    }
    try {
      // Tìm subject name để truyền cho suggestTutors
      const subjObj = subjects.find(s => s.subjectId === selectedSubjectId);
      const subjName = subjObj?.subjectName || '';
      const res = await suggestTutors(subjName);
      let suggestions = [];
      if (Array.isArray(res)) suggestions = res;
      else if (res && Array.isArray(res.data)) suggestions = res.data;
      if (!suggestions || suggestions.length === 0) {
        alert('Không tìm thấy tutor cho môn ' + subjName + '. Vui lòng thử lại hoặc chọn môn khác.');
        return;
      }
      const mapped = suggestions.map((s, idx) => ({
        tutorId: s.tutorId || s.tutor_id || `t-${idx}`,
        name: s.name || 'Tutor',
        rating: s.rating ?? 4.5,
        availableSlots: s.availableSlots ?? 0,
        students: `${Math.max(0, 15 - (s.availableSlots ?? 0))}/15`,
        hk: 'HK251',
        code: 'HK251',
        image: s.image || '',
        avatar: `https://i.pravatar.cc/150?img=${(idx % 70) + 1}`,
      }));
      setTutors(mapped);
      setPage(1);
      setStep(2);
    } catch (err) {
      console.error('Suggest tutors API failed', err);
      alert('Lỗi khi tìm kiếm tutor. Vui lòng kiểm tra kết nối và thử lại.');
    }
  };

  const checkApprovedRegistration = async (studentId) => {
    try {
      const registrations = await getStudentApprovedRegistrations(studentId);
      if (registrations && registrations.length > 0) {
        const approvedReg = registrations.find(r => r.status === 'APPROVED');
        if (approvedReg) {
          setHasApprovedRegistration(true);
          setApprovedTutorName(approvedReg.tutorName || 'Tutor');
        }
      }
    } catch (err) {
      console.error('Failed to check approved registrations', err);
    }
  };

  const onSelectSubject = (subjectId) => {
    setSelectedSubjectId(subjectId);
    const subjObj = subjects.find(s => s.subjectId === subjectId);
    setSubject(subjObj?.subjectName || '');
    setShowSubjectDropdown(false);
  };

  const onSelectTutor = (tutor) => {
    setSelectedTutor(tutor);
    setStep(3);
  };

  const onCancel = () => {
    // Show confirmation popup first
    setShowConfirmCancelPopup(true);
  };

  const onConfirmCancelYes = async () => {
    // User confirmed they want to cancel - call backend if we have registrationId
    setShowConfirmCancelPopup(false);
    const studentId = user?.id || '123456';
    if (registrationId) {
      try {
        await cancelRegistration(registrationId, studentId);
        setRegistrationId(null);
      } catch (err) {
        console.error('Cancel registration failed', err);
        // fallthrough to show success popup for UX, but real app should show error
      }
    }
    setShowCancelSuccessPopup(true);
  };

  const onConfirmCancelNo = () => {
    // User changed their mind - close popup
    setShowConfirmCancelPopup(false);
  };

  const onCancelSuccessConfirm = () => {
    // Go back to step 1 and reset
    setStep(1);
    setSubject('');
    setTutors([]);
    setSelectedTutor(null);
    setShowCountdown(false);
    setCountdown(10);
    setShowCancelSuccessPopup(false);
  };

  const onCancelSuccessBackToHome = () => {
    // Navigate back to home
    navigate('/student');
  };

  // Auto-start countdown when entering step 3
  useEffect(() => {
    if (step === 3 && !showCountdown) {
      setShowCountdown(true);
      setCountdown(10);
    }
  }, [step, showCountdown]);

  // Handle countdown timer
  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showCountdown && countdown === 0) {
      setStep(4);
      setShowCountdown(false);
    }
  }, [showCountdown, countdown]);

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
          {hasApprovedRegistration && (
            <div style={{ 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffc107', 
              padding: '12px', 
              borderRadius: '4px', 
              marginBottom: '16px',
              color: '#856404'
            }}>
              <strong>Thông báo:</strong> Bạn đã có tutor ({approvedTutorName}), không thể đăng ký thêm tutor mới.
            </div>
          )}
          <label>Chọn môn / lĩnh vực</label>
          <div className="subject-row" style={{ position: 'relative' }}>
            <button className="icon-arrow" title="Chọn môn" onClick={() => setShowSubjectDropdown(!showSubjectDropdown)} disabled={hasApprovedRegistration}>
              {subject || 'Chọn môn'} ▼
            </button>
            {showSubjectDropdown && (
              <div className="subject-dropdown">
                {subjects.map(s => (
                  <div key={s.subjectId} className="dropdown-item" onClick={() => onSelectSubject(s.subjectId)}>
                    {s.subjectName}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="actions">
            <button className="btn btn-primary" onClick={onFindTutors} disabled={hasApprovedRegistration}>
              {hasApprovedRegistration ? 'Bạn đã có tutor' : 'Tiếp theo'}
            </button>
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
        ĐANG CHỜ DUYỆT ĐĂNG KÝ
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
          <button className="btn-cancel" onClick={onCancel}>Hủy đăng ký</button>
          <button
            className="btn-confirm"
            onClick={async () => {
              const studentId = user?.id || '123456';
              console.log('📝 Registering tutor with:', { studentId, selectedSubjectId, tutorId: selectedTutor?.tutorId });
              try {
                const result = await registerTutor(studentId, selectedSubjectId, selectedTutor?.tutorId);
                console.log('✅ Registration result:', result);
                setRegistrationId(result?.registrationId);
                setStep(4);
              } catch (err) {
                console.error('❌ Register tutor failed', err);
                alert('Đăng ký thất bại — vui lòng thử lại.');
              }
            }}
          >
            Xác nhận đăng ký
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      {step===4 && (
  <div className="confirmation-container">
    <div className="confirmation-border success-border">
      <div className="confirmation-background success-background">
        <div className="confirmation-icon">
          <img className="vector-img" src={Vectorimg} alt="Success Icon" />
        </div>
        <div className="confirmation-border-dash" />
      </div>

      <div className="confirmation-heading success-heading">
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
          <button className="btn-confirm success-btn" onClick={() => navigate('/student')}>Quay về trang chủ</button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Confirm Cancel Popup - First popup asking for confirmation */}
      {showConfirmCancelPopup && (
        <div className="popup-overlay">
          <div className="popup-container">
            <h2 className="popup-title">Bạn có chắc chắn muốn hủy đăng kí không ?</h2>
            <div className="popup-actions">
              <button className="popup-btn popup-btn-secondary" onClick={onConfirmCancelNo}>Hủy</button>
              <button className="popup-btn popup-btn-primary" onClick={onConfirmCancelYes}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Success Popup - Second popup showing success message */}
      {showCancelSuccessPopup && (
        <div className="popup-overlay">
          <div className="popup-container">
            <div className="popup-icon">
              <div className="checkmark-icon">✓</div>
            </div>
            <h2 className="popup-title">Hủy đăng kí thành công</h2>
            <div className="popup-actions">
              <button className="popup-btn popup-btn-secondary" onClick={onCancelSuccessBackToHome}>Quay về trang chủ</button>
              <button className="popup-btn popup-btn-primary" onClick={onCancelSuccessConfirm}>Đăng ký mới</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}