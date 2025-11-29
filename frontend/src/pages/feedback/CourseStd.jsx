import React, { useEffect, useState } from "react";
import MeetingCard from "../../components/feedback/MeetingCard";
import "./CourseStd.css";
import { getOfficialMeetings } from "../../service/apiMeeting";
const CourseStd = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentStudentId = 1; // mac dinh studentId la 1
  const formatMeetingTime = (startStr, endStr) => {
    try {
      const startDate = new Date(startStr);
      const endDate = new Date(endStr);
      const start = startDate.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const end = endDate.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const date = startDate.toLocaleDateString("vi-VN");

      return `${start} - ${end}, ngày ${date}`;
    } catch (e) {
      return `${startStr} - ${endStr}`;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dataFromBackend = await getOfficialMeetings(currentStudentId);
        const formattedData = dataFromBackend.map((item) => ({
          meetingId: item.meetingId,
          topic: item.topic || "Chưa có chủ đề",
          date: formatMeetingTime(item.startTime, item.endTime),
          isWorkshop: item.type !== "APPOINTMENT",
        }));

        setMeetings(formattedData);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentStudentId]);

  return (
    <div className="course-std-page">
      <div className="top-actions">
        <button className="btn btn-outline">Danh sách tài liệu</button>
        <button className="btn btn-primary">Phản hồi chất lượng</button>
      </div>
      <div className="card-container">
        <h2 className="section-title">Buổi hẹn đã tham gia</h2>
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : meetings.length === 0 ? (
          <p>Chưa có buổi hẹn nào.</p>
        ) : (
          <div className="meeting-list">
            {meetings.map((item) => (
              <MeetingCard key={item.id} data={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default CourseStd;
