import React, { useState, useEffect, useCallback } from 'react';
import SearchBox from '../UI/SearchBox';
import { truncateText, escapeHtml, formatDateTime } from '../../utils/helpers';
import { apiService } from '../../services/api';
import { useData } from '../../contexts/DataContext';

const AuditLogs = () => {
  // Use Global Data
  const { auditLogs: globalLogs, loading: globalLoading, secondaryLoading, fetchAuditLogs } = useData();
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync with global data
  useEffect(() => {
    if (globalLogs) {
      setAuditLogs(globalLogs);
    }
    setLoading(globalLoading || secondaryLoading);
  }, [globalLogs, globalLoading, secondaryLoading]);

  // Fetch initial data
  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // Client-side filtering check
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // กำหนด action ที่ต้องการแสดงเท่านั้น
  const allowedActions = [
    'Admin Login',
    'Admin Logout',
    'Confirm Parcel',
    'Add Parcel',
    'Confirm Pickup',
    'สแกนเข้าระบบ',
    'กดรับของ',
    'Resolve Complaint',
    'Export Complaints',
    'Export Parcels'
  ];

  // Client-side filtering logic
  const applyFilters = useCallback((logs, currentSearchTerm, page) => {
    // 1. First filter by allowed actions
    const validLogs = (logs || []).filter(log => {
      const action = log.action || '';
      return allowedActions.includes(action) && action !== 'SESSION_CREATE';
    });

    // 2. Then sort
    const sortedLogs = validLogs.sort((a, b) => {
      return new Date(b.timestamp || b.created_at || 0) - new Date(a.timestamp || a.created_at || 0);
    });

    // 3. Then filter by search term
    if (!currentSearchTerm.trim()) {
      setFilteredLogs(sortedLogs);
    } else {
      const filtered = sortedLogs.filter(log => {
        const searchLower = currentSearchTerm.toLowerCase();
        return (
          (log.performed_by && log.performed_by.toLowerCase().includes(searchLower)) ||
          (log.action && log.action.toLowerCase().includes(searchLower)) ||
          (log.target && log.target.toLowerCase().includes(searchLower)) ||
          (log.details && log.details.toLowerCase().includes(searchLower)) ||
          (log.timestamp && log.timestamp.toLowerCase().includes(searchLower))
        );
      });
      setFilteredLogs(filtered);
    }
  }, [allowedActions]);

  // Apply filters whenever dependencies change
  useEffect(() => {
    applyFilters(auditLogs, searchTerm, currentPage);
  }, [auditLogs, searchTerm, currentPage, applyFilters]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to page 1 on search
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <li key="prev" className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
        <button className="page-link" onClick={() => paginate(currentPage - 1)}>
          <i className="bi bi-chevron-left"></i>
        </button>
      </li>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
          <button className="page-link" onClick={() => paginate(i)}>
            {i}
          </button>
        </li>
      );
    }

    // Next button
    pages.push(
      <li key="next" className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
        <button className="page-link" onClick={() => paginate(currentPage + 1)}>
          <i className="bi bi-chevron-right"></i>
        </button>
      </li>
    );

    return pages;
  };

  // แปลงชื่อ action ให้เป็นภาษาไทย
  const translateAction = (action) => {
    const actionMap = {
      'LOGIN': 'เข้าสู่ระบบ',
      'LOGOUT': 'ออกจากระบบ',
      'CREATE_PARCEL': 'เพิ่มพัสดุ',
      'PICKUP_PARCEL': 'รับพัสดุ',
      'RESOLVE_COMPLAINT': 'ปิดงานร้องเรียน',
      'UPDATE_USER': 'แก้ไขข้อมูลลูกบ้าน',
      'สแกนเข้าระบบ': 'สแกนพัสดุเข้า',
      'กดรับของ': 'กดรับพัสดุ',
      'Resolve Complaint': 'ปิดงานร้องเรียน'
    };
    return actionMap[action] || action;
  };

  return (
    <div id="auditLogs">
      <div className="card-custom">
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between mb-4 gap-3">
          <div>
            <h5 className="mb-1">
              <i className="bi bi-clock-history me-2"></i>
              ประวัติการทำงาน
            </h5>
            <small className="text-muted">บันทึกกิจกรรมทั้งหมดของแอดมิน</small>
            {!loading && (
              <div className="result-count mt-1">
                พบ {filteredLogs.length} รายการ (แสดง {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredLogs.length)})
              </div>
            )}
          </div>
          <div style={{ minWidth: '300px' }}>
            <SearchBox
              placeholder="ค้นหาประวัติ..."
              onSearch={handleSearch}
              delay={300}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>ผู้ดำเนินการ</th>
                <th>กิจกรรม</th>
                <th>เป้าหมาย</th>
                <th>วันเวลา</th>
                <th>รายละเอียด</th>
              </tr>
            </thead>
            <tbody id="auditLogsBody">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    <div className="spinner-border spinner-border-sm me-2"></div>
                    กำลังโหลดประวัติการทำงาน...
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((log, index) => (
                  <tr key={index}>
                    <td>{escapeHtml(log.performed_by || '-')}</td>
                    <td>
                      <span className="badge bg-primary bg-opacity-10 text-primary">
                        {translateAction(log.action)}
                      </span>
                    </td>
                    <td>{escapeHtml(log.target || '-')}</td>
                    <td className="text-nowrap">{escapeHtml(formatDateTime(log.timestamp) || '-')}</td>
                    <td>{escapeHtml(truncateText(log.details, 100))}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    {searchTerm ? 'ไม่พบประวัติการทำงานที่ตรงกับการค้นหา' : 'ไม่พบประวัติการทำงาน'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-3">
            <nav aria-label="Page navigation">
              <ul className="pagination justify-content-center" id="auditLogsPagination">
                {renderPagination()}
              </ul>
            </nav>
          </div>
        )}

        <div className="alert alert-light border mt-3">
          <h6>
            <i className="bi bi-shield-check me-2"></i>
            ประวัติการทำงานที่แสดง
          </h6>
          <p className="mb-0 small">
            แสดงเฉพาะประวัติการทำงานหลักที่สำคัญ ได้แก่: ล็อกอิน, ล็อกเอาต์, การกดยืนยันรับพัสดุ,
            การรับเรื่องร้องเรียน, และการส่งออกรายงานสรุป
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;