import React, { useState } from 'react';
import { apiService } from '../../services/api';
import { truncateText, escapeHtml } from '../../utils/helpers';

const ResolveModal = ({ isOpen, onClose, complaint, onResolved }) => {
  const [note, setNote] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !complaint) return null;

  const handleSubmit = async () => {
    if (!note.trim()) {
      setError('กรุณากรอกบันทึกการแก้ไข');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('note', note);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await apiService.resolveComplaint(complaint.id, formData);

      onClose();
      if (onResolved) onResolved();
      alert('อัปเดตสถานะและแจ้งผู้ร้องเรียนแล้ว');

    } catch (error) {
      setError('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
    } else {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      e.target.value = '';
    }
  };

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              ปิดงานร้องเรียน: {complaint.display_name || '-'}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            <div id="resolveSummary" className="small mb-3 text-muted">
              <div className="mb-1">
                <i className="bi bi-house me-1"></i>
                ห้อง {escapeHtml(complaint.room_number || '-')}
              </div>
              <div className="fw-semibold">
                {escapeHtml(truncateText(complaint.description || complaint.summary || '-', 120))}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">บันทึกการแก้ไข</label>
              <textarea
                className="form-control"
                id="resolveNote"
                rows="3"
                placeholder="รายละเอียดการดำเนินการ"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label">แนบรูป (ถ้ามี)</label>
              <input
                type="file"
                className="form-control"
                id="resolveImage"
                accept="image/*"
                onChange={handleFileChange}
              />
              {imageFile && (
                <small className="text-muted mt-1 d-block">
                  เลือกไฟล์แล้ว: {imageFile.name}
                </small>
              )}
            </div>

            {error && (
              <div className="alert alert-danger small mb-3">
                {error}
              </div>
            )}

            <div className="text-muted small">
              <i className="bi bi-info-circle me-1"></i>
              กดยืนยันแล้วระบบจะส่งแจ้งเตือนกลับผู้ร้องเรียนทันที
            </div>
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-outline-secondary"
              onClick={onClose}
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  กำลังประมวลผล...
                </>
              ) : 'ยืนยัน'}
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </div>
  );
};

export default ResolveModal;