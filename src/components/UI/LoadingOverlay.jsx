import React from 'react';

const LoadingOverlay = ({ text = 'กำลังวิเคราะห์ภาพ...', subtext = 'AI กำลังอ่านข้อมูลหน้ากล่อง' }) => {
  return (
    <div className="loading-overlay">
      <div className="ai-pulse"></div>
      <h5 className="fw-bold text-primary" id="loadingText">{text}</h5>
      <p className="text-muted small">{subtext}</p>
    </div>
  );
};

export default LoadingOverlay;