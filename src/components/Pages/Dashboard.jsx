import React from 'react';
import { useData } from '../../contexts/DataContext';
import StatCard from '../UI/StatCard';
import { escapeHtml } from '../../utils/helpers';

const Dashboard = () => {
  const { stats: globalStats, activities, upcomingParcels, loading, error } = useData();

  const stats = globalStats || {
    total_parcels: 0,
    in_time_all: 0,
    in_time_received: 0,
    outside_all: 0,
    outside_received: 0,
    total_received: 0,
  };

  /*
     Desired Order from User:
     1. ผู้ใช้ทั้งหมด (Total Users)
     2. พัสดุทั้งหมด (Total Parcels)
     3. รับแล้วทั้งหมด (Total Received)
     4. พัสดุในเวลา (In Time Pending)
     5. พัสดุรับแล้วในเวลา (In Time Received)
     6. พัสดุรับนอกเวลา (Outside Pending)
     7. พัสดุรับแล้วนอกเวลา (Outside Received)
  */
  const statCards = [
    { key: 'total_users', icon: 'bi-people-fill', label: 'ผู้ใช้ทั้งหมด', color: 'text-primary', bg: 'rgba(37, 99, 235, 0.1)' },
    { key: 'total_parcels', icon: 'bi-box-fill', label: 'พัสดุทั้งหมด', color: 'text-info', bg: 'rgba(13, 202, 240, 0.1)' },
    { key: 'total_received', icon: 'bi-archive-fill', label: 'รับแล้วทั้งหมด', color: 'text-success', bg: 'rgba(25, 135, 84, 0.1)' },

    { key: 'in_time_all', icon: 'bi-clock', label: 'พัสดุในเวลา', color: 'text-warning', bg: 'rgba(255, 193, 7, 0.1)' },
    { key: 'in_time_received', icon: 'bi-check-circle-fill', label: 'พัสดุรับแล้วในเวลา', color: 'text-success', bg: 'rgba(25, 135, 84, 0.1)' },

    { key: 'outside_all', icon: 'bi-moon-stars-fill', label: 'พัสดุนอกเวลา', color: 'text-purple', bg: 'rgba(111, 66, 193, 0.1)' },
    { key: 'outside_received', icon: 'bi-check2-all', label: 'พัสดุรับแล้วนอกเวลา', color: 'text-success', bg: 'rgba(25, 135, 84, 0.1)' },
  ];

  return (
    <div id="dashboard" className="fade-in">
      {error && (
        <div className="alert alert-danger mb-3">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      <div className="row mb-4">
        <div className="col-12">
          <div className="card-custom">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="text-secondary mb-0">
                <i className="bi bi-graph-up me-2"></i> สถิติพัสดุ
              </h5>
              <div className="text-muted small">
                <i className="bi bi-arrow-clockwise me-1"></i>
                อัปเดตแบบเรียลไทม์ เทส
              </div>
            </div>
            <div className="row g-3" id="dashboardStats">
              {statCards.map((card) => (
                <div key={card.key} className="col-6 col-sm-4 col-md-3 col-lg-3">
                  <StatCard
                    icon={card.icon}
                    number={stats[card.key] || 0}
                    label={card.label}
                    color={card.color}
                    bgColor={card.bg}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12 mb-4">
          <div className="card-custom h-100 card-hover">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="text-secondary mb-0">
                <i className="bi bi-clock-history me-2"></i> พัสดุคงค้างล่าสุด
              </h6>
              <span className="badge bg-warning bg-opacity-10 text-warning">
                {upcomingParcels.length} รายการ
              </span>
            </div>
            <div className="table-responsive">
              <table className="table table-sm table-hover mb-0">
                <thead>
                  <tr>
                    <th>ห้อง</th>
                    <th>ผู้รับ</th>
                    <th>ขนส่ง</th>
                    <th>ประเภท</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody id="upcomingParcels">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-4">
                        <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                        กำลังโหลดข้อมูล...
                      </td>
                    </tr>
                  ) : upcomingParcels.length > 0 ? (
                    upcomingParcels.slice(0, 10).map((parcel, index) => (
                      <tr key={index} className="align-middle">
                        <td data-label="ห้อง">
                          <span className="fw-semibold">{escapeHtml(parcel.room_number || '-')}</span>
                        </td>
                        <td data-label="ผู้รับ">{escapeHtml(parcel.recipient_name || '-')}</td>
                        <td data-label="ขนส่ง">
                          <span className="badge bg-light text-dark">
                            {escapeHtml(parcel.transport || parcel.courier || '-')}
                          </span>
                        </td>
                        <td data-label="ประเภท">
                          {parcel.is_after_hours ?
                            <span className="badge bg-purple-100 text-purple-800" style={{ color: '#6f42c1', backgroundColor: '#e0cffc' }}>นอกเวลา</span>
                            : <span className="badge bg-info bg-opacity-10 text-info">ในเวลา</span>
                          }
                        </td>
                        <td data-label="สถานะ">
                          <span className="badge bg-warning text-dark">รอรับ</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-4">
                        <i className="bi bi-box text-muted fs-4 mb-2 d-block"></i>
                        <div>ไม่มีพัสดุคงค้าง</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
