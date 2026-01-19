import React, { useState, useRef } from 'react';
import Swal from 'sweetalert2';
import LoadingOverlay from '../UI/LoadingOverlay';
import { apiService } from '../../services/api';

const Scan = () => {
  const [previewUrl, setPreviewUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState({ text: 'กำลังวิเคราะห์ภาพ...', subtext: 'AI กำลังอ่านข้อมูลหน้ากล่อง' });
  const [scanData, setScanData] = useState({
    room_number: '',
    recipient_name: '',
    transport: '',
    tracking_number: '',
    image_url: '',
    parcel_count: 0
  });
  const [userFound, setUserFound] = useState({
    exists: false,
    display_name: '',
    room_number: '',
    first_name: '',
    last_name: ''
  });
  const [hasScanned, setHasScanned] = useState(false);

  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (file) => {
    if (!file) return;

    // [NEW] Client-side validation
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'heic', 'heif'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      alert(`นามสกุลไฟล์ไม่รองรับ (รองรับ: ${allowedExtensions.join(', ')})`);
      return;
    }

    if (file.size > maxFileSize) {
      alert('ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 10MB)');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
      setShowPreview(true);
    };
    reader.readAsDataURL(file);

    // Upload to API
    setLoadingText({ text: 'กำลังวิเคราะห์ภาพ...', subtext: 'AI กำลังอ่านข้อมูลหน้ากล่อง' });
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await apiService.scanImage(formData);

      if (response.status === 'success') {
        setScanData({
          room_number: response.data.room_number !== "-" ? response.data.room_number : "",
          recipient_name: response.data.recipient_name !== "-" ? response.data.recipient_name : "",
          transport: response.data.transport !== "-" ? response.data.transport : "",
          tracking_number: response.data.tracking_number !== "-" ? response.data.tracking_number : "",
          image_url: response.data.image_url || '',
          parcel_count: response.data.parcel_count || 0
        });

        const foundData = response.data.user_found || { exists: false };
        setUserFound(foundData);
        setHasScanned(true);

        if (foundData.exists) {
          // Add validation classes
          document.getElementById('room_number')?.classList.add('is-valid');
          document.getElementById('room_number')?.classList.remove('is-invalid');
          document.getElementById('recipient_name')?.classList.add('is-valid');
          document.getElementById('recipient_name')?.classList.remove('is-invalid');
        } else {
          document.getElementById('room_number')?.classList.add('is-invalid');
          document.getElementById('room_number')?.classList.remove('is-valid');
          document.getElementById('recipient_name')?.classList.add('is-invalid');
          document.getElementById('recipient_name')?.classList.remove('is-valid');
        }

        setShowResult(true);
        // Scroll to result section
        document.getElementById('resultSection')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        alert('AI อ่านข้อมูลไม่ได้ กรุณาลองใหม่');
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraChange = (e) => {
    if (e.target.files.length) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleConfirm = async () => {
    const { room_number, recipient_name, transport, tracking_number, image_url } = scanData;

    if (!room_number && !recipient_name) {
      alert('กรุณาระบุ "เลขห้อง" หรือ "ชื่อผู้รับ" อย่างน้อย 1 อย่าง');
      return;
    }

    setLoadingText({ text: 'กำลังบันทึกข้อมูล...', subtext: 'กำลังส่งแจ้งเตือนไปยังผู้รับ' });
    setLoading(true);

    const payload = {
      room_number,
      recipient_name,
      transport,
      tracking_number,
      image_url
    };

    try {
      const adminName = localStorage.getItem('admin')
        ? JSON.parse(localStorage.getItem('admin')).name
        : 'Unknown Admin';

      const response = await apiService.confirmParcel(payload, adminName);

      if (response.status === 'success' || response.status === 'saved') {
        Swal.fire({
          icon: 'success',
          title: '✅ บันทึกและส่งแจ้งเตือนสำเร็จ',
          html: `
            <div class="text-start">
              <p class="mb-1"><b>🏠 ห้อง:</b> ${room_number}</p>
              <p class="mb-1"><b>👤 ชื่อผู้รับ:</b> ${recipient_name}</p>
              <p class="mb-1"><b>🚚 ขนส่ง:</b> ${transport}</p>
              <p class="mb-1"><b>📦 เลขพัสดุ:</b> ${tracking_number}</p>
              <hr class="my-2" />
              <h4 class="text-center text-primary fw-bold mb-0">PIN: ${response.pin}</h4>
            </div>
          `,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          willClose: () => {
            resetForm();
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'บันทึกไม่สำเร็จ',
          text: response.message || 'ไม่ทราบสาเหตุ'
        });
      }
    } catch (error) {
      console.error("Scan confirm error:", error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.message || 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPreviewUrl('');
    setShowPreview(false);
    setShowResult(false);
    setScanData({
      room_number: '',
      recipient_name: '',
      transport: '',
      tracking_number: '',
      image_url: '',
      parcel_count: 0
    });
    setUserFound({
      exists: false,
      display_name: '',
      room_number: '',
      first_name: '',
      last_name: ''
    });
    setHasScanned(false);

    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Remove validation classes
    document.getElementById('room_number')?.classList.remove('is-valid', 'is-invalid');
    document.getElementById('recipient_name')?.classList.remove('is-valid', 'is-invalid');

    window.scrollTo(0, 0);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setScanData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div id="scan">
      {loading && <LoadingOverlay text={loadingText.text} subtext={loadingText.subtext} />}

      <div className="card-custom mb-3">
        <h5 className="text-secondary mb-3">
          <i className="bi bi-camera me-2"></i> ถ่ายรูปหรืออัปโหลดพัสดุ
        </h5>

        <div
          className="upload-area d-flex justify-content-center align-items-center"
          onClick={handleCameraClick}
          style={{ cursor: 'pointer' }}
        >
          {showPreview ? (
            <img
              id="preview"
              src={previewUrl}
              alt="Preview"
              style={{ display: 'block', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          ) : (
            <div className="upload-placeholder text-center" id="placeholder">
              <i className="bi bi-cloud-upload fs-1 mb-2 text-muted"></i>
              <p className="mb-0 text-muted">แตะเพื่อถ่ายรูป (มือถือ) หรืออัปโหลด</p>
            </div>
          )}
        </div>

        <div className="d-flex gap-2 mt-3">
          <button
            className="btn btn-outline-primary btn-main flex-fill"
            type="button"
            onClick={handleCameraClick}
          >
            <i className="bi bi-camera-fill me-1"></i> ถ่ายรูป
          </button>
          <button
            className="btn btn-outline-secondary btn-main flex-fill"
            type="button"
            onClick={handleFileClick}
          >
            <i className="bi bi-folder2-open me-1"></i> อัปโหลดจากเครื่อง
          </button>
        </div>

        <input
          type="file"
          accept=".png,.jpg,.jpeg,.heic,.heif"
          capture="environment"
          ref={cameraInputRef}
          style={{ display: 'none' }}
          onChange={handleCameraChange}
        />
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.heic,.heif"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {showResult && (
        <div id="resultSection">
          <div className="card-custom mb-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-secondary mb-0">
                <i className="bi bi-pencil-square me-2"></i> ตรวจสอบข้อมูล
              </h6>
              <span className="badge bg-success bg-opacity-10 text-success">AI Processed</span>
            </div>

            <div className="row g-2">
              <div className="col-12 mb-2">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control fw-bold text-primary"
                    id="room_number"
                    placeholder="เลขห้อง"
                    value={scanData.room_number}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="roomNumber">
                    <i className="bi bi-house-door me-1"></i> เลขห้อง
                  </label>
                </div>
              </div>

              <div className="col-12 mb-2">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="recipient_name"
                    placeholder="ชื่อผู้รับ"
                    value={scanData.recipient_name}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="recipientName">
                    <i className="bi bi-person me-1"></i> ชื่อผู้รับ (ตามหน้ากล่อง)
                  </label>
                </div>
              </div>

              <div className="col-6 mb-2">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="transport"
                    placeholder="ขนส่ง"
                    value={scanData.transport}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="transport">
                    <i className="bi bi-truck me-1"></i> ขนส่ง
                  </label>
                </div>
              </div>

              <div className="col-6 mb-2">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="tracking_number"
                    placeholder="Tracking"
                    value={scanData.tracking_number}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="trackingNumber">
                    <i className="bi bi-upc-scan me-1"></i> เลขพัสดุ
                  </label>
                </div>
              </div>
            </div>

            <div className="alert alert-light border mt-3 mb-0">
              <small className="text-muted">
                <i className="bi bi-info-circle-fill text-primary me-1"></i>
                ระบบจะค้นหาเจ้าของห้องจาก <b>เลขห้อง</b> หรือ <b>ชื่อผู้รับ</b> และส่งไลน์แจ้งเตือนอัตโนมัติ
              </small>
            </div>

            {scanData.parcel_count > 0 && (
              <div className="d-flex align-items-center justify-content-between mt-3" id="parcelCountRow">
                <small className="text-muted mb-0">
                  <i className="bi bi-boxes me-1"></i> พัสดุคงค้างห้องนี้
                </small>
                <span className="badge bg-primary bg-opacity-10 text-primary" id="parcelCountBadge">
                  {scanData.parcel_count} ชิ้น
                </span>
              </div>
            )}

            {hasScanned && !userFound.exists && (
              <div className="alert alert-danger mt-3 mb-0 d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <div>
                  <strong>ไม่พบเจ้าของห้องในระบบ</strong><br />
                  <small>กรุณาตรวจสอบเลขห้อง/ชื่อ หรือให้ผู้ใช้ลงทะเบียนก่อน</small>
                </div>
              </div>
            )}

            {hasScanned && userFound.exists && (
              <div className="alert alert-success mt-3 mb-0 d-flex align-items-center">
                <i className="bi bi-check-circle-fill me-2"></i>
                <div>
                  <strong>พบเจ้าของห้อง</strong><br />
                  <small>{userFound.first_name} {userFound.last_name} (ห้อง {userFound.room_number})</small>
                </div>
              </div>
            )}
          </div>

          <div className="d-grid gap-2 mb-3">
            <button
              className="btn btn-main btn-primary"
              onClick={handleConfirm}
              disabled={!userFound.exists}
            >
              <i className="bi bi-send-fill me-2"></i> ยืนยันและแจ้งเตือน
            </button>
            <button
              className="btn btn-main btn-outline-secondary"
              onClick={resetForm}
            >
              <i className="bi bi-arrow-counterclockwise me-2"></i> เริ่มใหม่
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scan;