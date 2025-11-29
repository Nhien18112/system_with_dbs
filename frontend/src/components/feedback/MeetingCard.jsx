import React from "react";
import { useNavigate } from "react-router-dom";
import "./MeetingCard.css";

const MeetingCard = ({ data }) => {
  const navigate = useNavigate();
  return (
    <div className="meeting-card">
      <div className="card-header">
        <div className="meeting-title">Chủ đề: {data.topic}</div>
        <span
          className={`status-badge ${
            /*data.isWorkshop*/ true ? "workshop" : "meeting"
          }`}
        >
          {/*data.isWorkshop*/ true ? "✓ BUỔI HỘI THẢO" : "✓ BUỔI HẸN"}
        </span>
      </div>

      <p className="meeting-time">Thời gian: {data.date}</p>

      <div className="card-actions">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate(`/course/feedback/${data.meetingID}`)}
        >
          Phản hồi chất lượng
        </button>
      </div>
    </div>
  );
};

export default MeetingCard;
