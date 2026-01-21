import React, { useState } from 'react';
import { apiService } from '../../services/api';

const KnowledgeBase = () => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setError(null);
        } else {
            setFile(null);
            setError('กรุณาเลือกไฟล์ PDF เท่านั้น');
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setIsUploading(true);
        setMessage(null);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await apiService.uploadPdf(formData);
            setMessage(`สำเร็จ! อัปโหลดและประมวลผล ${res.chunks} ส่วนเรียบร้อยแล้ว`);
            setFile(null);
            // Reset file input
            document.getElementById('pdf-upload-input').value = '';
        } catch (err) {
            console.error('Upload Error:', err);
            setError(err.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12 col-md-8 mx-auto">
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white py-3 border-0">
                            <h5 className="mb-0 fw-bold">อัปโหลดไฟล์ความรู้ (PDF)</h5>
                        </div>
                        <div className="card-body p-4">
                            <div className="alert alert-info border-0 bg-light p-3 mb-4">
                                <i className="bi bi-info-circle me-2"></i>
                                คุณสามารถอัปโหลดคู่มือผู้อยู่อาศัย กฎระเบียบคอนโด หรือข้อมูลบริการต่างๆ เพื่อให้น้องบอตนำไปใช้ตอบคำถามลูกบ้านได้ครับ
                                <br />
                                <small className="text-muted">*ระบบจะใช้ชื่อไฟล์เป็นเอกลักษณ์ หากอัปโหลดชื่อเดิมระบบจะลบข้อมูลเก่าและเขียนทับให้โดยอัตโนมัติ</small>
                            </div>

                            <form onSubmit={handleUpload}>
                                <div className="mb-4">
                                    <label className="form-label fw-bold">เลือกไฟล์ PDF</label>
                                    <div className={`upload-area p-4 border-2 border-dashed rounded-3 text-center ${file ? 'border-primary bg-light' : 'border-gray-300'}`}>
                                        <i className={`bi ${file ? 'bi-file-earmark-pdf-fill text-primary' : 'bi-cloud-arrow-up text-muted'} display-4 mb-2`}></i>
                                        <div className="mb-3">
                                            {file ? (
                                                <span className="fw-medium text-primary">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                            ) : (
                                                <span className="text-muted">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</span>
                                            )}
                                        </div>
                                        <input
                                            id="pdf-upload-input"
                                            type="file"
                                            accept=".pdf"
                                            className="form-control"
                                            onChange={handleFileChange}
                                            disabled={isUploading}
                                        />
                                    </div>
                                    {error && <div className="text-danger mt-2 small">{error}</div>}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 py-2 fw-bold shadow-sm"
                                    disabled={!file || isUploading}
                                >
                                    {isUploading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            กำลังประมวลผล...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-upload me-2"></i>
                                            เริ่มการอัปโหลดและประมวลผล
                                        </>
                                    )}
                                </button>
                            </form>

                            {message && (
                                <div className="alert alert-success mt-4 border-0 animate__animated animate__fadeIn">
                                    <i className="bi bi-check-circle-fill me-2"></i>
                                    {message}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <h6 className="fw-bold mb-3">คำแนะนำในการอัปโหลด</h6>
                            <ul className="text-muted small mb-0 ps-3">
                                <li className="mb-1">รองรับเฉพาะไฟล์ .pdf เท่านั้น</li>
                                <li className="mb-1">ควรระบุข้อความใน PDF ให้ชัดเจน เพื่อให้ AI ค้นหาและสรุปได้แม่นยำ</li>
                                <li className="mb-1">หลีกเลี่ยง PDF ที่เป็นรูปภาพล้วน (OCR อาจจะทำงานได้ไม่สมบูรณ์เท่าข้อความจริง)</li>
                                <li>หากมีการเปลี่ยนแปลงเนื้อหา เพียงแค่อัปโหลดไฟล์ชื่อเดิมทับเข้าไป ระบบจะอัปเดตข้อมูลให้ทันที</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .border-dashed { border-style: dashed !important; }
                .border-gray-300 { border-color: #dee2e6 !important; }
                .rounded-3 { border-radius: 0.5rem !important; }
                .upload-area { cursor: pointer; transition: all 0.2s; }
                .upload-area:hover { background-color: #f8f9fa; border-color: #0d6efd; }
            `}} />
        </div>
    );
};

export default KnowledgeBase;
