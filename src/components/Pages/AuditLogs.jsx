import React, { useState, useEffect } from 'react';
import SearchBox from '../UI/SearchBox';
import { truncateText, escapeHtml, formatDateTime } from '../../utils/helpers';
import { apiService } from '../../services/api';

const AuditLogs = () => {
  const [activeTab, setActiveTab] = useState('admin'); // 'admin' or 'user'
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async (type) => {
    setLoading(true);
    try {
      const res = await apiService.getAuditLogs(type);
      if (res.status === 'success') {
        setLogs(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(activeTab);
  }, [activeTab]);

  const handleExport = () => {
    // Trigger CSV download
    const url = `${apiService.baseUrl}/api/admin/logs/export?type=${activeTab}&token=${apiService.getSessionToken()}`;
    window.open(url, '_blank');
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (log.performed_by && log.performed_by.toLowerCase().includes(term)) ||
      (log.action && log.action.toLowerCase().includes(term)) ||
      (log.details && log.details.toLowerCase().includes(term))
    );
  });

  const getActionColor = (action) => {
    switch (action) {
      case 'Admin Login': return 'bg-success bg-opacity-10 text-success';
      case 'Admin Logout': return 'bg-secondary bg-opacity-10 text-secondary';
      case 'Scan Parcel': return 'bg-primary bg-opacity-10 text-primary';
      case 'Pickup Parcel': return 'bg-info bg-opacity-10 text-info';
      case 'Self Pickup Scan (Success)': return 'bg-success bg-opacity-10 text-success';
      case 'Self Pickup Scan (Failed)': return 'bg-danger bg-opacity-10 text-danger';
      case 'Self Pickup Cancel': return 'bg-warning bg-opacity-10 text-warning';
      default: return 'bg-light text-dark';
    }
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
            <small className="text-muted">แสดง 20 รายการล่าสุด</small>
          </div>

          <div className="d-flex gap-2">
            <div className="btn-group">
              <button
                className={`btn btn-sm ${activeTab === 'admin' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('admin')}
              >
                นิติบุคคล
              </button>
              <button
                className={`btn btn-sm ${activeTab === 'user' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('user')}
              >
                ผู้ใช้งาน
              </button>
            </div>
            <button className="btn btn-sm btn-success" onClick={handleExport}>
              <i className="bi bi-download me-1"></i> Export CSV
            </button>
          </div>

          <div style={{ minWidth: '250px' }}>
            <SearchBox placeholder="ค้นหา..." onSearch={setSearchTerm} />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>ผู้ดำเนินการ</th>
                <th>กิจกรรม</th>
                <th>เป้าหมาย</th>
                <th>วันเวลา</th>
                <th>รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    <div className="spinner-border spinner-border-sm me-2"></div>
                    กำลังโหลด...
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => (
                  <tr key={index}>
                    <td className="fw-bold">{escapeHtml(log.performed_by || '-')}</td>
                    <td>
                      <span className={`badge ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>{escapeHtml(log.target || '-')}</td>
                    <td>{formatDateTime(log.timestamp)}</td>
                    <td className="text-muted small">{escapeHtml(truncateText(log.details, 60))}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">ไม่พบข้อมูล</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;