import React from 'react';

const StatCard = ({ icon, number, label, color = 'text-primary', bgColor = 'rgba(37, 99, 235, 0.1)' }) => {
  // Map colors to corresponding CSS classes
  const colorClasses = {
    'text-primary': 'text-primary',
    'text-info': 'text-info',
    'text-success': 'text-success',
    'text-warning': 'text-warning',
    'text-danger': 'text-danger',
    'text-secondary': 'text-secondary'
  };

  const colorClass = colorClasses[color] || 'text-primary';

  return (
    <div 
      className="stat-card card-hover" 
      style={{ 
        backgroundColor: bgColor,
        border: '1px solid rgba(0,0,0,0.05)'
      }}
    >
      <div className={`stat-icon ${colorClass}`}>
        <i className={`bi ${icon}`}></i>
      </div>
      <div className={`stat-number ${colorClass}`}>
        {number.toLocaleString()}
      </div>
      <div className="stat-label">
        {label}
      </div>
    </div>
  );
};

export default StatCard;