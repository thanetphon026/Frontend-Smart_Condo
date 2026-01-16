import React from 'react';
import { apiService } from '../../services/api';

const Export = () => {
  const handleExportComplaints = () => {
    const link = document.createElement('a');
    link.href = `${apiService.getExportComplaintsUrl()}`;
    link.download = `complaints_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportParcels = () => {
    const link = document.createElement('a');
    link.href = `${apiService.getExportParcelsUrl()}`;
    link.download = `parcels_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="export">
      <div className="card-custom mb-3">
        <h5 className="text-secondary mb-3">
          <i className="bi bi-file-earmark-excel me-2"></i> ส่งออกรายงานสรุป
        </h5>

        <p className="text-muted mb-4">
          ระบบส่วนหลังบ้านรองรับการส่งออกข้อมูลเรื่องร้องเรียนและข้อมูลพัสดุในรูปแบบไฟล์ Excel หรือ CSV
          เพื่อให้นิติบุคคลนำไปใช้ในการจัดทำรายงานสรุปประจำเดือนและการวิเคราะห์สถิติ
        </p>

        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card-custom h-100">
              <div className="text-center mb-3">
                <i className="bi bi-chat-left-text text-primary" style={{ fontSize: '3rem' }}></i>
              </div>
              <h6 className="text-center mb-3">รายงานข้อมูลร้องเรียน</h6>
              <p className="text-muted small text-center mb-4">
                ส่งออกรายงานข้อมูลร้องเรียนทั้งหมดในรูปแบบ CSV
              </p>
              <button
                className="btn btn-primary w-100"
                onClick={handleExportComplaints}
              >
                <i className="bi bi-download me-2"></i>
                ส่งออกรายงานร้องเรียน
              </button>
              <div className="mt-3 text-muted small">
                <i className="bi bi-info-circle me-1"></i>
                ประกอบด้วย: ห้อง, คำอธิบาย, สถานะ, ความสำคัญ, วันที่แจ้ง, วันที่แก้ไข
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <div className="card-custom h-100">
              <div className="text-center mb-3">
                <i className="bi bi-box-seam text-success" style={{ fontSize: '3rem' }}></i>
              </div>
              <h6 className="text-center mb-3">รายงานข้อมูลพัสดุ</h6>
              <p className="text-muted small text-center mb-4">
                ส่งออกรายงานข้อมูลพัสดุทั้งหมดในรูปแบบ CSV
              </p>
              <button
                className="btn btn-success w-100"
                onClick={handleExportParcels}
              >
                <i className="bi bi-download me-2"></i>
                ส่งออกรายงานพัสดุ
              </button>
              <div className="mt-3 text-muted small">
                <i className="bi bi-info-circle me-1"></i>
                ประกอบด้วย: ห้อง, ผู้รับ, บริษัทขนส่ง, สถานะ, วันที่รับเข้า, วันที่รับออก
              </div>
            </div>
          </div>
        </div>

        <div className="alert alert-info mt-4">
          <h6>
            <i className="bi bi-info-circle-fill me-2"></i>
            ข้อมูลรายงาน
          </h6>
          <p className="mb-0 small">
            ไฟล์ CSV ที่ส่งออกสามารถเปิดได้ด้วย Microsoft Excel, Google Sheets หรือโปรแกรมสเปรดชีตอื่นๆ
            เพื่อใช้ในการวิเคราะห์ข้อมูลและจัดทำรายงานสรุปประจำเดือน
          </p>
        </div>
      </div>
    </div>
  );
};

export default Export;