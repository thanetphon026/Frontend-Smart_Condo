import React from 'react';
import { NAV_ITEMS } from '../../utils/constants';

const Sidebar = ({ activeTab, onTabChange, adminName, onLogout, isOpen, onClose }) => {
  return (
    <>
      <div className={`sidebar p-3 ${isOpen ? 'open' : ''}`} id="sidebar">
        <h5 className="text-white mb-4">
          <i className="bi bi-grid me-2"></i> Smart Condo
        </h5>
        <div className="mb-4">
          <small className="text-white-50">เข้าสู่ระบบในนาม</small>
          <div className="text-white fw-bold" id="adminName">
            {adminName || 'ผู้ดูแลระบบ'}
          </div>
        </div>
        <nav className="nav flex-column">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              <i className={`bi ${item.icon} me-2`}></i>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-3 border-top border-gray-700">
          <button className="btn btn-outline-light btn-sm w-100" onClick={onLogout}>
            <i className="bi bi-box-arrow-right me-2"></i>
            ออกจากระบบ
          </button>
        </div>
      </div>
      {isOpen && (
        <div 
          className="sidebar-overlay show" 
          onClick={onClose}
        />
      )}
    </>
  );
};

export default Sidebar;