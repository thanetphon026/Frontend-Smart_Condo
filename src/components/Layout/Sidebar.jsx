import React from 'react';
import { NAV_ITEMS } from '../../utils/constants';

const Sidebar = ({ activeTab, onTabChange, adminName, onLogout, isOpen, onClose }) => {
  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
        <div className="p-3 d-flex align-items-center justify-content-between border-bottom border-gray-700 mb-3">
          <h5 className="text-white mb-0">
            <i className="bi bi-grid-fill me-2"></i> Smart Condo
          </h5>
          <button className="sidebar-close-btn" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="px-3 mb-4">
          <div className="d-flex align-items-center gap-2 p-2 rounded-3 bg-white bg-opacity-10">
            <div className="flex-shrink-0">
              <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-person text-white"></i>
              </div>
            </div>
            <div className="overflow-hidden">
              <small className="text-white-50 d-block" style={{ fontSize: '10px' }}>เข้าสู่ระบบในนาม</small>
              <div className="text-white fw-bold text-truncate small" id="adminName">
                {adminName || 'ผู้ดูแลระบบ'}
              </div>
            </div>
          </div>
        </div>

        <nav className="nav flex-column px-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              <i className={`bi ${item.icon} me-2`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto p-3 border-top border-gray-700">
          <button className="btn btn-outline-light btn-sm w-100 py-2 d-flex align-items-center justify-content-center gap-2" onClick={onLogout}>
            <i className="bi bi-box-arrow-right"></i>
            <span>ออกจากระบบ</span>
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