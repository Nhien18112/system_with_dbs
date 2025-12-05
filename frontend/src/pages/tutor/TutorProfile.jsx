import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./TutorProfile.css"; 
import avatarImg from "../../assets/avatar.svg";
import { useAuth } from "../../AuthContext";
import { getUserProfile } from "../../api/userApi"; 


const TutorProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || user?.bkNetId; 

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    if (!userId) {
      setError("Không tìm thấy ID người dùng để tải hồ sơ.");
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getUserProfile(userId); 
        setProfileData(data); 
      } catch (err) {
        console.error("Lỗi khi tải hồ sơ:", err);
        setError("Không thể tải thông tin hồ sơ. Vui lòng thử lại.");
        setProfileData(null);
      } finally {
        setLoading(false); 
      }
    };

    fetchUserProfile();
  }, [userId]); 


  if (loading) {
    return <div className="student-page-inner">Đang tải hồ sơ...</div>;
  }

  // 4. Xử lý trạng thái Lỗi
  if (error) {
    return <div className="student-page-inner" style={{ color: 'red' }}>Lỗi: {error}</div>;
  }
  
  // 5. Nếu không có dữ liệu (và không lỗi/loading), có thể hiển thị thông báo
  if (!profileData) {
    return <div className="student-page-inner">Không có dữ liệu hồ sơ.</div>;
  }

  // 6. Sau khi tải thành công, sử dụng profileData thay vì user
  // Giả sử API trả về các trường tương tự như: name, studentId, department, email, phone
  
  // Tránh việc phải thay đổi quá nhiều tên biến trong JSX, ta đặt tên lại cho dễ dùng
  // Sửa đổi dòng này trong component StudentProfile
const {
    fullName: name,
    MS, 
    bkNetId, 
    major,
    faculty,      
    email,
    phoneNumber,
    gpa,
    yearOfStudy
  } = profileData;
  return (
    <div className="tutor-profile-page">
      {/* Tabs trên cùng: Thông tin cá nhân / Lịch rảnh */}
      <div className="top-tabs">
        <button className="tab-btn tab-btn-active">
          Thông tin cá nhân
        </button>
        <button
          className="tab-btn"
          onClick={() => navigate("/tutor/free-slots")}
        >
          Lịch rảnh
        </button>
      </div>

      {/* Card trắng thông tin tutor */}
      <div className="profile-card">
        {/* Cột trái: avatar + tên + nút thêm ảnh */}
        <div className="profile-left">
          <div className="avatar-circle">
            <img src={avatarImg} alt="Avatar" className="avatar-img" />
          </div>

          <div className="tutor-name">Trần Văn B</div>

          <button className="add-photo-btn">Thêm ảnh</button>
        </div>

        {/* Cột phải: bảng thông tin */}
        <div className="profile-right">
          <div className="profile-row header-row">
            <div className="col-label">Họ và tên</div>
            <span className="profile-value">{name}</span>
          </div>
          <div className="profile-row">
            <div className="col-label">bkNetId</div>
            <span className="profile-value">{bkNetId}</span>
          </div>
          <div className="profile-row">
            <div className="col-label">Khoa/Bộ môn</div>
            <span className="profile-value">{faculty}</span>
          </div>
          <div className="profile-row">
            <div className="col-label">Chuyên ngành</div>
            <span className="profile-value">{major}</span>
          </div>
          <div className="profile-row">
            <div className="col-label">Email</div>
            <span className="profile-value">{email}</span>
          </div>
          <div className="profile-row">
            <div className="col-label">Số điện thoại</div>
            <span className="profile-value">{phoneNumber}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorProfile;