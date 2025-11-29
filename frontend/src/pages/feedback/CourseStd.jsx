import React, { useEffect, useState } from "react";
import MeetingCard from "../../components/feedback/MeetingCard";
import "./CourseStd.css";

const CourseStd = () => {
  const [meetings, setMeetings] = useState([]);
  //Du lieu mau khi API loi
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

  // Lay danh sach buoi hen tu BE

  useEffect(() => {
    fetch("http://localhost:8080/api/meetings")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setMeetings(data);
      })
      .catch((error) => {
        console.error("Lỗi khi tải danh sách", error);
        //Dung du lieu mau neu API loi
        setMeetings(sampleMeetings);
      });
  }, []);

  return (
    <div className="course-std-page">
      <div className="top-actions">
        <button className="btn btn-outline">Danh sách tài liệu</button>
        <button className="btn btn-primary">Phản hồi chất lượng</button>
      </div>
      <div className="card-container">
        <h2 className="section-title">Buổi hẹn đã tham gia</h2>
        <div className="meeting-list">
          {meetings.length === 0 ? (
            <p>Đang tải dữ liệu...</p>
          ) : (
            meetings.map((item) => (
              <MeetingCard key={item.meetingID} data={item} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default CourseStd;
