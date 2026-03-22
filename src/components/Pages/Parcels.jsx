import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import SearchBox from '../UI/SearchBox';
import Modal from '../UI/Modal';
import ConfirmModal from '../UI/ConfirmModal';
import { apiService } from '../../services/api';
import { escapeHtml, formatDateTime } from '../../utils/helpers';
import { useData } from '../../contexts/DataContext';


const RealTimeClock = () => {
  const { getNow } = useData();
  const [time, setTime] = useState(getNow());

  useEffect(() => {
    const timer = setInterval(() => setTime(getNow()), 1000);
    return () => clearInterval(timer);
  }, [getNow]);

  return (
    <div className="text-secondary fw-bold" style={{ fontSize: '0.9rem' }}>
      <i className="bi bi-clock me-1"></i>
      {time.toLocaleTimeString('th-TH')}
    </div>
  );
};

const RegistrationStatus = () => {
  const { getNow } = useData();
  const [status, setStatus] = useState({ isOpen: false, text: 'กำลังตรวจสอบ...' });

  useEffect(() => {
    const checkStatus = () => {
      const now = getNow();
      const hour = now.getHours();
      const minute = now.getMinutes();
      // Open 08:00 - 17:30
      const currentTime = hour * 60 + minute;
      const openTime = 8 * 60 + 30;
      const closeTime = 17 * 60 + 30;

      if (currentTime >= openTime && currentTime <= closeTime) {
        setStatus({ isOpen: true, text: '🟢 เปิดลงทะเบียนรับนอกเวลา (08:30 - 17:30)' });
      } else {
        setStatus({ isOpen: false, text: '🔴 ปิดลงทะเบียนรับนอกเวลา (08:30 - 17:30)' });
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [getNow]);

  return (
    <small className={`badge ${status.isOpen ? 'bg-success' : 'bg-danger'}`}>
      {status.text}
    </small>
  );
};

const Parcels = () => {
  const { parcels: allParcels, loading: globalLoading, secondaryLoading, refreshData } = useData();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageModal, setImageModal] = useState({ isOpen: false, imageUrl: '' });
  const [activeTab, setActiveTab] = useState('regular'); // 'regular' or 'after-hours'
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, pin: null });

  // Sync loading
  useEffect(() => {
    setLoading(globalLoading || secondaryLoading);
  }, [globalLoading, secondaryLoading]);

  // PURE CLIENT-SIDE FILTERING (with after-hours tab support)
  const applyFilters = useCallback((allData, search, tab) => {
    if (!allData) return;
    let result = [...allData];

    // Filter by tab (regular vs after-hours)
    if (tab === 'after-hours') {
      result = result.filter(item => item.is_after_hours === true);
    } else {
      result = result.filter(item => !item.is_after_hours);
    }

    if (search && search.trim() !== '') {
      const lowerTerm = search.toLowerCase().trim();
      result = result.filter(item =>
        (item.room_number && item.room_number.toLowerCase().includes(lowerTerm)) ||
        (item.recipient_name && item.recipient_name.toLowerCase().includes(lowerTerm)) ||
        (item.tracking_number && item.tracking_number.toLowerCase().includes(lowerTerm)) ||
        (item.pin && item.pin.toLowerCase().includes(lowerTerm)) ||
        (item.transport && item.transport.toLowerCase().includes(lowerTerm)) ||
        (item.courier && item.courier.toLowerCase().includes(lowerTerm))
      );
    }

    setParcels(result);
  }, []);

  // Re-run filter when data, search, or tab changes
  useEffect(() => {
    applyFilters(allParcels, searchTerm, activeTab);
  }, [allParcels, searchTerm, activeTab, applyFilters]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const handleExport = () => {
    try {
      const exportUrl = apiService.getExportAfterHoursParcelsUrl();
      window.open(exportUrl, '_blank');

      Swal.fire({
        icon: 'success',
        title: 'เริ่มการดาวโหลด...',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Export ไม่สำเร็จ',
        text: error.message
      });
    }
  };

  const handlePickupClick = (pin) => {
    setConfirmModal({ isOpen: true, pin });
  };

  const handlePickup = async (pin) => {
    setConfirmModal({ isOpen: false, pin: null });

    // Optimistic UI Update - ลบออกจากรายการทันที
    const originalParcels = [...parcels];
    setParcels(prev => prev.filter(p => p.pin !== pin));

    try {
      await apiService.pickupParcel(pin);

      Swal.fire({
        icon: 'success',
        title: 'รับพัสดุสำเร็จ!',
        timer: 1500,
        showConfirmButton: false
      });

      // ⚡ FORCE IMMEDIATE REFRESH to sync with server
      setTimeout(() => refreshData(), 500);

    } catch (error) {
      // Revert optimistic update on error
      setParcels(originalParcels);
      refreshData();

      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.message
      });
    }
  };

  return (
    <div id="parcels">
      <div className="card-custom mb-3">
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2 mb-3">
          <div className="flex-grow-1">
            <h5 className="mb-1">พัสดุคงค้าง</h5>
            <small className="text-muted">รายการพัสดุที่ยังไม่รับ</small>
            {!loading && (
              <div className="result-count">
                พบ {parcels.length} รายการ
              </div>
            )}
          </div>

          <div className="d-flex flex-column align-items-end me-3">
            <RealTimeClock />
            <RegistrationStatus />
          </div>

          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => refreshData()}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            {loading ? 'กำลังโหลด...' : 'รีเฟรช'}
          </button>
          <div style={{ maxWidth: '420px', width: '100%' }}>
            <SearchBox
              placeholder="ค้นหาพัสดุ..."
              onSearch={handleSearch}
            />
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="d-flex gap-2 mb-3 align-items-center">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'regular' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('regular')}
            >
              <i className="bi bi-box-seam me-1"></i>
              ภายในเวลา
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'after-hours' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('after-hours')}
            >
              <i className="bi bi-moon-stars me-1"></i>
              นอกเวลา (18:00-08:30)
            </button>
          </div>

          {activeTab === 'after-hours' && (
            <button
              className="btn btn-sm btn-success ms-auto"
              onClick={handleExport}
              disabled={parcels.length === 0}
            >
              <i className="bi bi-download me-1"></i>
              Export CSV
            </button>
          )}
        </div>

        <div className="table-responsive">
          <table className="table table-hover table-parcel align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '90px' }}>รูป</th>
                <th>ห้อง</th>
                <th>ผู้รับ</th>
                <th>PIN</th>
                <th>ขนส่ง</th>
                <th>Tracking</th>
                <th style={{ width: '100px' }}>วิธีนำเข้า</th>
                <th style={{ width: '140px' }}>เวลาที่รับ</th>
                <th style={{ width: '120px' }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center text-muted">
                    <div className="spinner-border spinner-border-sm me-2"></div>
                    กำลังโหลดข้อมูลพัสดุ...
                  </td>
                </tr>
              ) : parcels.length > 0 ? (
                parcels.map((parcel, index) => (
                  <tr key={parcel.id || index}>
                    <td data-label="รูปภาพ">
                      {parcel.image_url ? (
                        <img
                          src={parcel.image_url}
                          alt="parcel"
                          className="parcel-thumb"
                          onClick={() => setImageModal({ isOpen: true, imageUrl: parcel.image_url })}
                          style={{ cursor: 'zoom-in' }}
                          loading="lazy"
                        />
                      ) : (
                        <div className="text-muted small">ไม่มีรูป</div>
                      )}
                    </td>
                    <td data-label="ห้อง">{escapeHtml(parcel.room_number || '-')}</td>
                    <td data-label="ผู้รับ">{escapeHtml(parcel.recipient_name || '-')}</td>
                    <td data-label="รหัสรับของ" className="fw-bold text-primary text-nowrap">
                      {escapeHtml(parcel.pin || '-')}
                    </td>
                    <td data-label="ขนส่ง">{escapeHtml(parcel.transport || parcel.courier || '-')}</td>
                    <td data-label="Tracking" className="text-nowrap">{escapeHtml(parcel.tracking_number || '-')}</td>
                    <td data-label="วิธีนำเข้า" className="text-center">
                      {parcel.scan_method === 'manual' ? (
                        <span className="badge bg-warning bg-opacity-10 text-warning" title="บันทึกข้อมูลเอง">
                        บันทึกข้อมูลเอง
                        </span>
                      ) : (
                        <span className="badge bg-success bg-opacity-10 text-success" title="ระบบอัตโนมัติ (AI)">
                        ระบบอัตโนมัติ
                        </span>
                      )}
                    </td>
                    <td data-label="เวลา" className="text-nowrap small">
                      {formatDateTime(parcel.timestamp)}
                    </td>
                    <td data-label="จัดการ">
                      {activeTab !== 'after-hours' && (
                        <button
                          className="btn btn-success btn-sm w-100"
                          onClick={() => handlePickupClick(parcel.pin)}
                        >
                          กดรับของ
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center text-muted">
                    {searchTerm ? 'ไม่พบพัสดุที่ตรงกับการค้นหา' : 'ไม่พบพัสดุคงค้าง'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Modal */}
      <Modal
        isOpen={imageModal.isOpen}
        onClose={() => setImageModal({ ...imageModal, isOpen: false })}
        title="รูปพัสดุ"
        type="image"
      >
        <img
          src={imageModal.imageUrl}
          alt="Parcel"
          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
        />
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, pin: null })}
        onConfirm={() => handlePickup(confirmModal.pin)}
        title="ยืนยันการรับพัสดุ"
        message={`คุณต้องการยืนยันการรับพัสดุ PIN ${confirmModal.pin} ใช่หรือไม่?`}
      />
    </div>
  );
};

export default Parcels;