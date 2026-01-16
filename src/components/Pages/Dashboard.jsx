import React from 'react';
import { useData } from '../../contexts/DataContext';
import StatCard from '../UI/StatCard';
import { escapeHtml } from '../../utils/helpers';

const Dashboard = () => {
  const { stats: globalStats, activities, upcomingParcels, loading, error } = useData();

  // Ensure stats object has defaults if initial load isn't ready
  const stats = globalStats || {
    users: 0,
    total_complaints: 0,
    resolved_complaints: 0,
    pending_complaints: 0,
    pending_high: 0,
    pending_medium: 0,
    pending_low: 0,
    total_parcels: 0,
    picked_up_parcels: 0,
    pending_parcels: 0,
  };

  // We rely on Global Polling now, so we don't need local effects for data


  const statCards = [
    { key: 'users', icon: 'bi-people-fill', label: 'ผู้ใช้งานทั้งหมด', color: 'text-primary', bg: 'rgba(37, 99, 235, 0.1)' },
    { key: 'total_complaints', icon: 'bi-chat-left-text-fill', label: 'ร้องเรียนทั้งหมด', color: 'text-info', bg: 'rgba(13, 202, 240, 0.1)' },
    { key: 'resolved_complaints', icon: 'bi-check-circle-fill', label: 'ร้องเรียนแก้ไขแล้ว', color: 'text-success', bg: 'rgba(25, 135, 84, 0.1)' },
    { key: 'pending_complaints', icon: 'bi-exclamation-circle-fill', label: 'ร้องเรียนรอดำเนินการ', color: 'text-warning', bg: 'rgba(255, 193, 7, 0.1)' },
    { key: 'pending_high', icon: 'bi-exclamation-triangle-fill', label: 'ความสำคัญสูง', color: 'text-danger', bg: 'rgba(220, 53, 69, 0.1)' },
    { key: 'pending_medium', icon: 'bi-exclamation-circle-fill', label: 'ความสำคัญกลาง', color: 'text-warning', bg: 'rgba(255, 193, 7, 0.1)' },
    { key: 'pending_low', icon: 'bi-check-circle-fill', label: 'ความสำคัญต่ำ', color: 'text-success', bg: 'rgba(25, 135, 84, 0.1)' },
    { key: 'total_parcels', icon: 'bi-box-fill', label: 'พัสดุทั้งหมด', color: 'text-secondary', bg: 'rgba(108, 117, 125, 0.1)' },
    { key: 'picked_up_parcels', icon: 'bi-check-square-fill', label: 'พัสดุรับแล้ว', color: 'text-primary', bg: 'rgba(37, 99, 235, 0.1)' },
    { key: 'pending_parcels', icon: 'bi-box-seam-fill', label: 'พัสดุคงค้าง', color: 'text-info', bg: 'rgba(13, 202, 240, 0.1)' },
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
                <i className="bi bi-graph-up me-2"></i> สถิติภาพรวม
              </h5>
              <div className="text-muted small">
                <i className="bi bi-arrow-clockwise me-1"></i>
                อัปเดตแบบเรียลไทม์
              </div>
            </div>
            <div className="row g-3" id="dashboardStats">
              {statCards.map((card) => (
                <div key={card.key} className="col-md-3 col-6">
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
        <div className="col-md-6 mb-4">
          <div className="card-custom h-100 card-hover">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="text-secondary mb-0">
                <i className="bi bi-activity me-2"></i> กิจกรรมล่าสุด
              </h6>
              <span className="badge bg-primary bg-opacity-10 text-primary">
                {activities.length} กิจกรรม
              </span>
            </div>
            <div className="list-group list-group-flush" id="recentActivity">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                  กำลังโหลดกิจกรรมล่าสุด...
                </div>
              ) : activities.length > 0 ? (
                activities.slice(0, 8).map((activity, index) => (
                  <div key={index} className="list-group-item border-0 px-0 py-3">
                    <div className="d-flex align-items-start">
                      <div className="flex-shrink-0">
                        <i className={`bi ${activity.icon || 'bi-info-circle'} ${activity.color || 'text-primary'} fs-5`}></i>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <div className="mb-1">{activity.message || '-'}</div>
                        {activity.details && (
                          <div className="small text-muted">{activity.details}</div>
                        )}
                        <div className="small text-muted mt-1">
                          <i className="bi bi-clock me-1"></i>
                          {activity.timestamp || '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-info-circle text-muted fs-4 mb-2 d-block"></i>
                  <div className="text-muted">ไม่มีกิจกรรมล่าสุด</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card-custom h-100 card-hover">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="text-secondary mb-0">
                <i className="bi bi-clock-history me-2"></i> พัสดุคงค้าง
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
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody id="upcomingParcels">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">
                        <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                        กำลังโหลดข้อมูลพัสดุ...
                      </td>
                    </tr>
                  ) : upcomingParcels.length > 0 ? (
                    upcomingParcels.slice(0, 8).map((parcel, index) => (
                      <tr key={index} className="align-middle">
                        <td>
                          <span className="fw-semibold">{escapeHtml(parcel.room_number || '-')}</span>
                        </td>
                        <td>{escapeHtml(parcel.recipient_name || '-')}</td>
                        <td>
                          <span className="badge bg-light text-dark">
                            {escapeHtml(parcel.transport || parcel.courier || '-')}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-warning text-nowrap">รอรับ</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">
                        <i className="bi bi-box text-muted fs-4 mb-2 d-block"></i>
                        <div>ไม่มีพัสดุรอรับ</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {upcomingParcels.length > 5 && (
              <small className="text-muted">
                แสดง 8 จาก {upcomingParcels.length} รายการ
              </small>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;