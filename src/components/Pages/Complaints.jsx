import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import SearchBox from '../UI/SearchBox';
import PriorityBadge from '../UI/PriorityBadge';
import StatusBadge from '../UI/StatusBadge';
import { apiService } from '../../services/api';
import { truncateText, escapeHtml, formatDateTime } from '../../utils/helpers';
import Modal from '../UI/Modal';
import { useData } from '../../contexts/DataContext';

const Complaints = () => {
  // Use Global Data
  const { complaints: allComplaints, loading: globalLoading, secondaryLoading, refreshData } = useData();
  const [complaints, setComplaints] = useState([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [sortBy, setSortBy] = useState('priority:desc');

  // Sync loading with global initial load
  useEffect(() => {
    setLoading(globalLoading || secondaryLoading);
  }, [globalLoading, secondaryLoading]);

  // Modal states
  const [textModal, setTextModal] = useState({ isOpen: false, title: '', content: '' });
  const [imageModal, setImageModal] = useState({ isOpen: false, imageUrl: '' });
  const [resolveModal, setResolveModal] = useState({
    isOpen: false,
    complaintId: null,
    note: '',
    file: null,
    isSubmitting: false
  });

  // Helper: Calculate Priority Score for Sorting
  const getPriorityScore = (priority) => {
    const p = (priority || 'low').toLowerCase();
    if (p === 'high') return 3;
    if (p === 'medium') return 2;
    return 1;
  };

  // MAIN FILTER FUNCTION: Runs purely on client side
  const applyFilters = useCallback((data, status, sort, search) => {
    if (!data) return;
    let result = [...data];

    // 1. Filter by Status
    if (status !== 'all') {
      result = result.filter(item => {
        const itemStatus = (item.status || 'pending').toLowerCase();
        if (status === 'resolved') return itemStatus === 'resolved';
        return itemStatus !== 'resolved'; // 'pending' covers everything not resolved
      });
    }

    // 2. Filter by Search Term
    if (search && search.trim() !== '') {
      const lowerTerm = search.toLowerCase().trim();
      result = result.filter(item =>
        (item.description && item.description.toLowerCase().includes(lowerTerm)) ||
        (item.room_number && item.room_number.toLowerCase().includes(lowerTerm)) ||
        (item.display_name && item.display_name.toLowerCase().includes(lowerTerm)) ||
        (item.summary && item.summary.toLowerCase().includes(lowerTerm))
      );
    }

    // 3. Sort
    result.sort((a, b) => {
      if (sort === 'priority:desc') {
        const scoreA = getPriorityScore(a.priority);
        const scoreB = getPriorityScore(b.priority);
        if (scoreA !== scoreB) return scoreB - scoreA;
        return new Date(b.timestamp) - new Date(a.timestamp);
      } else if (sort === 'time:desc') {
        return new Date(b.timestamp) - new Date(a.timestamp);
      } else if (sort === 'time:asc') {
        return new Date(a.timestamp) - new Date(b.timestamp);
      }
      return 0;
    });

    setComplaints(result);
  }, []);

  // Re-run Client-side Filter whenever Global Data or UI States change
  useEffect(() => {
    applyFilters(allComplaints, statusFilter, sortBy, searchTerm);
  }, [allComplaints, statusFilter, sortBy, searchTerm, applyFilters]);

  // UI Handlers
  const handleSearch = (term) => setSearchTerm(term);
  const handleStatusChange = (status) => setStatusFilter(status);
  const handleSortChange = (e) => setSortBy(e.target.value);

  const handleResolve = (complaint) => {
    setResolveModal({
      isOpen: true,
      complaintId: complaint.id,
      note: '',
      file: null,
      isSubmitting: false
    });
  };

  const handleResolveSubmit = async () => {
    if (!resolveModal.note.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณาระบุรายละเอียดการแก้ไข'
      });
      return;
    }

    // Capture current state for optimistic UI
    const previousComplaints = [...complaints];
    const targetId = resolveModal.complaintId;

    // ⚡ CLOSE MODAL IMMEDIATELY
    setResolveModal({ isOpen: false, complaintId: null, note: '', file: null, isSubmitting: false });

    // ⚡ OPTIMISTIC UPDATE: Mark as resolved in UI instantly
    setComplaints(prev => prev.map(c =>
      c.id === targetId ? { ...c, status: 'resolved' } : c
    ));

    try {
      const formData = new FormData();
      formData.append('note', resolveModal.note);
      if (resolveModal.file) {
        formData.append('image', resolveModal.file);
      }

      await apiService.resolveComplaint(targetId, formData);

      // Success - Silent sync
      refreshData();

      Swal.fire({
        icon: 'success',
        title: 'ดำเนินการเสร็จสิ้น!',
        text: 'ส่งแจ้งเตือนไปยัง LINE ผู้ใช้เรียบร้อยแล้ว',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.message
      });
      // Revert if failed
      setComplaints(previousComplaints);
    }
  };

  const openTextModal = (title, content) => {
    setTextModal({ isOpen: true, title, content });
  };

  const openImageModal = (imageUrl) => {
    setImageModal({ isOpen: true, imageUrl });
  };

  return (
    <div id="complaints">
      <div className="card-custom mb-3">
        <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
          <div>
            <h5 className="mb-0">ศูนย์ร้องเรียน</h5>
            <small className="text-muted">ติดตามสถานะและตอบกลับผู้อยู่อาศัยแบบเรียลไทม์</small>
            {!loading && (
              <div className="result-count">
                พบ {complaints.length} รายการ
                {complaints.length >= 95 && (
                  <div className="alert alert-info small mt-2 mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    แสดง 100 รายการล่าสุด (รายการที่ปิดงานแล้วจะถูกลบอัตโนมัติหลัง 90 วัน)
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="ms-auto d-flex flex-wrap gap-2 align-items-center">
            <div className="btn-group" role="group">
              <input
                type="radio"
                className="btn-check"
                name="complaintStatus"
                id="statusPending"
                checked={statusFilter === 'pending'}
                onChange={() => handleStatusChange('pending')}
              />
              <label className="btn btn-outline-primary btn-sm" htmlFor="statusPending">
                <i className="bi bi-hourglass-split me-1"></i> รอดำเนินการ
              </label>

              <input
                type="radio"
                className="btn-check"
                name="complaintStatus"
                id="statusResolved"
                checked={statusFilter === 'resolved'}
                onChange={() => handleStatusChange('resolved')}
              />
              <label className="btn btn-outline-primary btn-sm" htmlFor="statusResolved">
                <i className="bi bi-check-circle me-1"></i> ดำเนินการเสร็จสิ้น
              </label>

              <input
                type="radio"
                className="btn-check"
                name="complaintStatus"
                id="statusAll"
                checked={statusFilter === 'all'}
                onChange={() => handleStatusChange('all')}
              />
              <label className="btn btn-outline-primary btn-sm" htmlFor="statusAll">
                <i className="bi bi-list-ul me-1"></i> ทั้งหมด
              </label>
            </div>

            <div style={{ maxWidth: '250px', width: '100%' }}>
              <SearchBox
                placeholder="ค้นหาร้องเรียน..."
                onSearch={handleSearch}
              />
            </div>

            <div className="input-group" style={{ width: '200px' }}>
              <span className="input-group-text bg-light border-0">
                <i className="bi bi-filter"></i>
              </span>
              <select
                className="form-select"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="priority:desc">เรียงตามความสำคัญ</option>
                <option value="time:desc">ล่าสุดก่อน</option>
                <option value="time:asc">เก่าก่อน</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle table-complaint mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '15%' }}>ผู้ใช้/ห้อง</th>
                <th style={{ width: '25%' }}>รายละเอียด</th>
                <th style={{ width: '20%' }}>วิเคราะห์ด้วย AI</th>
                <th style={{ width: '100px' }}>รูป</th>
                <th style={{ width: '120px' }}>วันที่แจ้ง</th>
                <th style={{ width: '100px' }}>ความสำคัญ</th>
                <th style={{ width: '120px' }}>สถานะ</th>
                <th style={{ width: '120px' }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted">
                    <div className="spinner-border spinner-border-sm me-2"></div>
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : complaints.length > 0 ? (
                complaints.map((complaint, index) => (
                  <tr key={complaint.id || index}>
                    <td>
                      <div className="fw-semibold">{escapeHtml(complaint.display_name || '-')}</div>
                      <div className="text-muted small">
                        <i className="bi bi-house-door me-1"></i>
                        {escapeHtml(complaint.room_number || '-')}
                      </div>
                    </td>
                    <td>
                      <span className="cell-ellipsis" title={complaint.description || '-'}>
                        {truncateText(complaint.description || '-', 60)}
                      </span>
                      {complaint.description && complaint.description.length > 60 && (
                        <div
                          className="text-primary small mt-1"
                          style={{ cursor: 'pointer' }}
                          onClick={() => openTextModal('รายละเอียดแจ้งซ่อม', complaint.description)}
                        >
                          <i className="bi bi-eye me-1"></i> ดูเพิ่มเติม
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="ai-preview cell-ellipsis" title={complaint.summary || '-'}>
                        {truncateText(complaint.summary || '-', 80)}
                      </span>
                      {complaint.summary && complaint.summary.length > 80 && (
                        <div
                          className="text-primary small mt-1"
                          style={{ cursor: 'pointer' }}
                          onClick={() => openTextModal('วิเคราะห์ด้วย AI', complaint.summary)}
                        >
                          <i className="bi bi-stars me-1"></i> อ่านทั้งหมด
                        </div>
                      )}
                    </td>
                    <td>
                      {complaint.image_url ? (
                        <img
                          src={complaint.image_url}
                          className="complaint-thumb"
                          alt="complaint"
                          loading="lazy"
                          onClick={() => openImageModal(complaint.image_url)}
                          style={{ cursor: 'zoom-in' }}
                        />
                      ) : (
                        <span className="text-muted small">ไม่มีรูป</span>
                      )}
                    </td>
                    <td className="text-nowrap small fw-semibold">
                      {formatDateTime(complaint.timestamp)}
                    </td>
                    <td>
                      <PriorityBadge priority={complaint.priority} />
                    </td>
                    <td>
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td>
                      {complaint.status && complaint.status.toLowerCase() === 'resolved' ? (
                        <span className="text-success small fw-semibold">ปิดงานแล้ว</span>
                      ) : (
                        <button
                          className="btn btn-outline-success btn-sm w-100"
                          onClick={() => handleResolve(complaint)}
                        >
                          เสร็จสิ้น
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-muted">
                    {searchTerm ? 'ไม่พบรายการร้องเรียนที่ตรงกับการค้นหา' : 'ยังไม่มีการร้องเรียน'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={textModal.isOpen}
        onClose={() => setTextModal({ ...textModal, isOpen: false })}
        title={textModal.title}
      >
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
          {textModal.content}
        </div>
      </Modal>

      <Modal
        isOpen={imageModal.isOpen}
        onClose={() => setImageModal({ ...imageModal, isOpen: false })}
        title="รูปภาพแนบ"
        type="image"
      >
        <img
          src={imageModal.imageUrl}
          alt="Original"
          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
        />
      </Modal>

      <Modal
        isOpen={resolveModal.isOpen}
        onClose={() => setResolveModal({ ...resolveModal, isOpen: false })}
        title="ดำเนินการเสร็จสิ้น"
      >
        <div className="mb-3">
          <label htmlFor="resolveNote" className="form-label fw-bold">
            <i className="bi bi-pencil me-1"></i> รายละเอียดการแก้ไข (ส่งทาง LINE)
          </label>
          <textarea
            className="form-control"
            id="resolveNote"
            rows="4"
            placeholder="แจ้งรายละเอียดการดำเนินการ..."
            value={resolveModal.note}
            onChange={(e) => setResolveModal({ ...resolveModal, note: e.target.value })}
          ></textarea>
        </div>

        <div className="mb-3">
          <label htmlFor="resolveImage" className="form-label fw-bold">
            <i className="bi bi-image me-1"></i> รูปภาพประกอบ (ถ้ามี)
          </label>
          <input
            className="form-control"
            type="file"
            id="resolveImage"
            accept=".png,.jpg,.jpeg,.heic,.heif"
            onChange={(e) => setResolveModal({ ...resolveModal, file: e.target.files[0] })}
          />
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setResolveModal({ ...resolveModal, isOpen: false })}
            disabled={resolveModal.isSubmitting}
          >
            ยกเลิก
          </button>
          <button
            type="button"
            className="btn btn-success"
            onClick={handleResolveSubmit}
            disabled={resolveModal.isSubmitting}
          >
            {resolveModal.isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                กำลังส่งข้อมูล...
              </>
            ) : (
              <>
                <i className="bi bi-send-fill me-1"></i> ยืนยันและส่งแจ้งเตือน
              </>
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Complaints;