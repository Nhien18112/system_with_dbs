import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, ArrowLeft } from "lucide-react";
import "./FeedbackPage.css";
import SuccessPopup from "../../components/feedback/SuccessPopup";

const FeedbackPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Poppup
  const [showPopup, setShowPopup] = useState(false);

  // State luu thong tin buoi hen va lich su phan hoi
  const [meeting, setMeeting] = useState(null);
  const [history, setHistory] = useState([]);

  // State luu thong tin form phan hoi
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const sampleMeetings = [
    {
      meetingID: 1,
      date: "2025-11-30",
      timestart: "08:00",
      timeend: "10:00",
      topic: "Ôn tập Toán Cao Cấp - Ma trận",
    },
    {
      meetingID: 2,
      date: "2025-12-01",
      timestart: "14:00",
      timeend: "16:00",
      topic: "Lập trình Web - ReactJS cơ bản",
    },
    {
      meetingID: 3,
      date: "2025-12-05",
      timestart: "09:30",
      timeend: "11:30",
      topic: "Tiếng Anh giao tiếp - Topic: Travel",
    },
  ];

  useEffect(() => {
    //Lay thong tin buoi hen
    const fetchMeetingInfo = () => {
      fetch("http://localhost:8080/api/meetings")
        .then((res) => res.json())
        .then((data) => {
          const found = data.find((m) => m.meetingID.toString() === id);
          if (found) setMeeting(found);
        })
        .catch((error) => {
          console.error("Lỗi khi tải thông tin buổi hẹn", error);
          const found = sampleMeetings.find(
            (m) => m.meetingID.toString() === id
          );
          if (found) setMeeting(found);
        });
    };

    //Lay lich su phan hoi
    const fetchHistory = () => {
      fetch(`http://localhost:8080/api/feedbacks?meetingID=${id}`)
        .then((res) => res.json())
        .then((data) => {
          setHistory(data);
        });
    };

    fetchMeetingInfo();
    fetchHistory();
  }, [id]);

  // Gui phan hoi
  const handleSubmit = () => {
    if (rating === 0) {
      alert("Vui lòng chọn số sao đánh giá!");
      return;
    }

    const payload = {
      meetingID: parseInt(id),
      rating: rating,
      comment: comment,
    };

    //Gui phan hoi len BE
    fetch("http://localhost:8080/api/feedbacks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Gửi thất bại");
      })
      .then((newFeedback) => {
        // Hien popup thanh cong va cap nhat lich su
        setShowPopup(true);
        setHistory([newFeedback, ...history]);
        setComment("");
        setRating(0);
      })
      .catch((err) => alert("Có lỗi xảy ra: " + err.message));
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  if (!meeting) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div className="feedback-page-wrapper">
      <SuccessPopup isOpen={showPopup} onClose={handleClosePopup} />
      <div className="top-actionss">
        <div className="left-actions-group">
          <button className="btn btn-outline">Danh sách tài liệu</button>
          <button className="btn btn-primary active-tab">
            Phản hồi chất lượng
          </button>
        </div>

        <button className="btn btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          Quay Lại
        </button>
      </div>

      <div className="feedback-content-container">
        <div className="feedback-card form-card">
          <div className="info-grid">
            <div className="info-item">
              <h3 className="info-label">Nội dung</h3>
              <p className="info-content">{meeting.topic}</p>
            </div>
            <div className="info-item text-right-md">
              <h3 className="info-label">Thời gian</h3>
              <p className="info-content">{meeting.date}</p>
            </div>
          </div>

          <div className="rating-section">
            <h3 className="info-label">Chất lượng buổi học</h3>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={28}
                  className="star-icon"
                  fill={star <= rating ? "#0ea5e9" : "#d1d5db"}
                  color={star <= rating ? "#0ea5e9" : "#d1d5db"}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>

          <div className="comment-section">
            <h3 className="info-label">Nhận xét</h3>
            <textarea
              className="feedback-textarea"
              placeholder="Ý kiến nhận xét"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
          </div>

          <button className="btn-submit" onClick={handleSubmit}>
            Gửi
          </button>
        </div>

        <div className="feedback-card history-card">
          <h3 className="info-label" style={{ marginBottom: "15px" }}>
            Lịch sử phản hồi
          </h3>

          {history.length === 0 ? (
            <p style={{ color: "#999", fontStyle: "italic" }}>
              Chưa có phản hồi nào.
            </p>
          ) : (
            history.map((item, index) => (
              <div key={index} className="history-item">
                <div className="history-date">
                  {item.submitAt
                    ? new Date(item.submitAt).toLocaleString()
                    : "Vừa xong"}
                </div>
                <div className="history-detail">
                  <Star
                    size={16}
                    fill="#eab308"
                    color="#eab308"
                    style={{ marginRight: "5px" }}
                  />
                  <span>
                    <strong>{item.rating}/5</strong> — {item.comment}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
