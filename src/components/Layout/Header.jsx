import React from 'react';

const Header = ({ title, subtitle, adminName, onMenuToggle, onLogout }) => {
  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-topbar">
        <button className="btn btn-light btn-sm" onClick={onMenuToggle}>
          <i className="bi bi-list"></i>
        </button>
        <h4 className="fw-bold mb-0" id="mobileTitle">{title}</h4>
        <span className="badge bg-light text-dark">Back Office</span>
        <button className="btn btn-outline-light btn-sm" onClick={onLogout}>
          <i className="bi bi-box-arrow-right"></i>
        </button>
      </div>

      {/* Desktop Header */}
      <div className="content-header">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-light" onClick={onMenuToggle}>
              <i className="bi bi-list"></i>
            </button>
            <h3 className="mb-1" id="pageTitle">
              <i className="bi bi-speedometer2 me-2"></i>
              {title}
            </h3>
            <small id="pageSubtitle">{subtitle}</small>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <div className="text-white small">นิติบุคคล</div>
              <div className="text-white fw-bold" id="headerAdminName">
                {adminName || 'ผู้ดูแลระบบ'}
              </div>
            </div>
            <div className="badge bg-light text-dark">Back Office</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;