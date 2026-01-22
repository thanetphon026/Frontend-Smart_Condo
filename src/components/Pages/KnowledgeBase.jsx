import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../../services/api';
import { useData } from '../../contexts/DataContext';

const KnowledgeBase = () => {
    const { loading: globalLoading } = useData();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const fetchDocuments = useCallback(async () => {
        try {
            setLoading(true);
            const docs = await apiService.getDocuments();
            setDocuments(docs || []);
        } catch (err) {
            console.error("Error fetching documents:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setMessage(null);
        setError(null);

        if (!selectedFile) {
            setFile(null);
            return;
        }

        // Validation
        const isPDF = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
        const isUnder10MB = selectedFile.size <= 10 * 1024 * 1024;

        if (!isPDF) {
            setError('❌ กรุณาเลือกไฟล์ PDF เท่านั้น');
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        if (!isUnder10MB) {
            setError('❌ ไฟล์มีขนาดใหญ่เกินไป (จำกัดไม่เกิน 10MB)');
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setFile(selectedFile);
    };

    const handleUpload = async (e) => {
        if (e) e.preventDefault();
        if (!file) return;

        setIsUploading(true);
        setMessage(null);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await apiService.uploadPdf(formData);
            setMessage(`✅ สำเร็จ! อัปโหลดเอกสารเรียบร้อยแล้ว (${res.chunks} ส่วน)`);
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            fetchDocuments();
        } catch (err) {
            console.error('Upload Error:', err);
            setError(err.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (filename) => {
        if (!window.confirm(`ยืนยันการลบเอกสาร "${filename}"?`)) {
            return;
        }

        try {
            await apiService.deleteDocument(filename);
            fetchDocuments();
            setMessage(`ลบเอกสาร ${filename} สำเร็จ`);
        } catch (err) {
            console.error("Delete error:", err);
            alert(err.message || "เกิดข้อผิดพลาดในการลบเอกสาร");
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = 2;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <div id="knowledge-base">
            <div className="card-custom mb-3">
                <h5 className="text-secondary mb-3">
                    <i className="bi bi-journal-plus me-2"></i> จัดการความรู้ (Knowledge Base)
                </h5>

                {/* Large Upload Block - Scan Page style */}
                <div
                    className={`upload-area d-flex flex-column justify-content-center align-items-center mb-4 ${file ? 'border-primary bg-light' : ''}`}
                    onClick={handleFileClick}
                    style={{
                        height: '280px',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '20px',
                        backgroundColor: '#f8fafc',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {file ? (
                        <div className="text-center p-3 animate__animated animate__fadeIn">
                            <i className="bi bi-file-earmark-pdf-fill text-danger display-1 mb-3"></i>
                            <h5 className="fw-bold text-dark mb-1 text-truncate" style={{ maxWidth: '400px' }}>{file.name}</h5>
                            <p className="text-muted mb-3 small">ขนาดไฟล์: {formatFileSize(file.size)}</p>
                            <span className="btn btn-sm btn-outline-primary rounded-pill px-3">
                                <i className="bi bi-arrow-repeat me-1"></i> เปลี่ยนไฟล์
                            </span>
                        </div>
                    ) : (
                        <div className="upload-placeholder text-center p-4">
                            <i className="bi bi-cloud-upload display-4 mb-3 text-muted opacity-50"></i>
                            <h5 className="fw-bold text-dark mb-2">กดเพื่อเลือกไฟล์ PDF หรือลากไฟล์มาวาง</h5>
                            <div className="badge bg-secondary bg-opacity-10 text-secondary px-3 py-2 rounded-pill mt-2">
                                <i className="bi bi-info-circle me-1"></i> รับเฉพาะ .pdf เท่านั้น (สูงสุด 10MB)
                            </div>
                        </div>
                    )}
                </div>

                <input
                    type="file"
                    accept=".pdf"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    disabled={isUploading}
                />

                <div className="d-grid gap-2 mb-4">
                    <button
                        className="btn btn-primary btn-lg fw-bold shadow-sm rounded-3"
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                        style={{ padding: '15px' }}
                    >
                        {isUploading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                กำลังอัปโหลดและประมวลผล...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-cloud-arrow-up-fill me-2"></i> ยืนยันการอัปโหลดเอกสาร
                            </>
                        )}
                    </button>
                    {file && !isUploading && (
                        <button className="btn btn-link btn-sm text-muted" onClick={() => setFile(null)}>
                            ยกเลิก
                        </button>
                    )}
                </div>

                {error && <div className="alert alert-danger border-0 shadow-sm py-3 mb-4 animate__animated animate__shakeX"><i className="bi bi-exclamation-triangle-fill me-2"></i> {error}</div>}
                {message && <div className="alert alert-success border-0 shadow-sm py-3 mb-4 animate__animated animate__fadeIn"><i className="bi bi-check-circle-fill me-2"></i> {message}</div>}

                <hr className="my-4 opacity-50" />

                {/* Table Section */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h6 className="fw-bold text-secondary mb-0">
                        <i className="bi bi-journal-text me-2"></i> เอกสารทั้งหมดในระบบ ({documents.length})
                    </h6>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: '60px' }} className="ps-3 text-center">#</th>
                                <th>ชื่อเอกสาร</th>
                                <th className="text-center">ส่วน (Chunks)</th>
                                <th className="text-center">ประเภท</th>
                                <th style={{ width: '100px' }} className="text-end pe-4">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted py-5">
                                        <div className="spinner-border spinner-border-sm me-2"></div>
                                        กำลังดึงข้อมูล...
                                    </td>
                                </tr>
                            ) : documents.length > 0 ? (
                                documents.map((doc, index) => (
                                    <tr key={index}>
                                        <td className="ps-3 text-center text-muted">{index + 1}</td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-file-earmark-pdf text-danger me-2 fs-5"></i>
                                                <span className="fw-medium text-dark text-truncate" style={{ maxWidth: '300px' }}>{doc.filename}</span>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3">
                                                {doc.chunks}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <span className="text-muted small">
                                                <i className="bi bi-hdd-network me-1"></i>
                                                Vector Storage
                                            </span>
                                        </td>
                                        <td className="text-end pe-4">
                                            <button
                                                className="btn btn-outline-danger btn-sm rounded-circle border-0"
                                                onClick={() => handleDelete(doc.filename)}
                                                title="ลบเอกสาร"
                                                style={{ width: '36px', height: '36px' }}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted py-5">
                                        <i className="bi bi-inbox display-4 d-block mb-3 opacity-25"></i>
                                        ยังไม่มีเอกสารในคลังความรู้
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default KnowledgeBase;
