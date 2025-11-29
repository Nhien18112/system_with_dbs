import React from "react";
import "./SuccessPopup.css";
import { Check } from "lucide-react";

const SuccessPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3 className="popup-title">Gửi phản hồi thành công</h3>

        <div className="popup-icon-container">
          <div className="popup-icon-circle">
            <Check size={40} color="white" strokeWidth={3} />
          </div>
        </div>

        <button className="popup-btn" onClick={onClose}>
          Quay lại
        </button>
      </div>
    </div>
  );
};

export default SuccessPopup;
