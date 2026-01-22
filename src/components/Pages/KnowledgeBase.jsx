import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import SearchBox from '../UI/SearchBox';
import { useData } from '../../contexts/DataContext';

const KnowledgeBase = () => {
    const { loading: globalLoading, secondaryLoading, refreshData } = useData();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [showUpload, setShowUpload] = useState(false);

    // Initial fetch and sync with global loading if appropriate
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

    // Client-side filtering
    const filteredDocuments = documents.filter(doc =>
        doc.filename.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

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
            setMessage(`สำเร็จ! เพิ่มเอกสารเรียบร้อยแล้ว (${res.chunks} ส่วน)`);
            setFile(null);
            if (document.getElementById('pdf-upload-input')) {
                document.getElementById('pdf-upload-input').value = '';
            }
            setShowUpload(false);
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
        } catch (err) {
            console.error("Delete error:", err);
            alert(err.message || "เกิดข้อผิดพลาดในการลบเอกสาร");
        }
    };

    return (
        <div id="knowledge-base">
            <div className="card-custom mb-3">
                {/* Header Section - Identical to Parcels.jsx */}
                <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2 mb-3">
                    <div className="flex-grow-1">
                        <h5 className="mb-1">จัดการคลังความรู้ (KB)</h5>
                        <small className="text-muted">ข้อมูล PDF สำหรับ AI ประมวลผลและตอบคำถามลูกบ้าน</small>
                        {!loading && (
                            <div className="result-count">
                                พบ {filteredDocuments.length} รายการ
                            </div>
                        )}
                    </div>

                    <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => fetchDocuments()}
                        disabled={loading}
                    >
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        {loading ? 'กำลังโหลด...' : 'รีเฟรช'}
                    </button>

                    <button
                        className={`btn btn-sm ${showUpload ? 'btn-secondary' : 'btn-success'}`}
                        onClick={() => setShowUpload(!showUpload)}
                    >
                        <i className={`bi ${showUpload ? 'bi-x-lg' : 'bi-plus-lg'} me-1`}></i>
                        {showUpload ? 'ปิดฟอร์ม' : 'เพิ่มเอกสารใหม่'}
                    </button>

                    <div style={{ maxWidth: '300px', width: '100%' }}>
                        <SearchBox
                            placeholder="ค้นหาชื่อเอกสาร..."
                            onSearch={handleSearch}
                        />
                    </div>
                </div>

                {/* Upload Form Section (Inline like a filter or separate area inside card) */}
                {showUpload && (
                    <div className="bg-light p-3 rounded-3 mb-4 border fade-in">
                        <h6 className="fw-bold mb-3">อัปโหลดไฟล์ PDF</h6>
                        <form onSubmit={handleUpload}>
                            <div className="row g-2 align-items-center">
                                <div className="col-grow">
                                    <input
                                        id="pdf-upload-input"
                                        type="file"
                                        accept=".pdf"
                                        className="form-control form-control-sm"
                                        onChange={handleFileChange}
                                        disabled={isUploading}
                                    />
                                </div>
                                <div className="col-auto">
                                    <button
                                        type="submit"
                                        className="btn btn-sm btn-primary px-4"
                                        disabled={!file || isUploading}
                                    >
                                        {isUploading ? (
                                            <span className="spinner-border spinner-border-sm me-1"></span>
                                        ) : (
                                            <i className="bi bi-cloud-upload me-1"></i>
                                        )}
                                        อัปโหลด
                                    </button>
                                </div>
                            </div>
                            {error && <div className="text-danger small mt-2">{error}</div>}
                            {message && <div className="text-success small mt-2">{message}</div>}
                            <div className="text-muted small mt-2">
                                * ไฟล์ภาษาไทยรองรับได้ดี หากอัปโหลดชื่อซ้ำ ข้อมูลเก่าจะถูกแทนที่อัตโนมัติ
                            </div>
                        </form>
                    </div>
                )}

                {/* Table Section - Identical style to Parcels.jsx */}
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: '50px' }}>#</th>
                                <th>ชื่อเอกสาร</th>
                                <th>จำนวนข้อความ (Chunks)</th>
                                <th>สถานะ</th>
                                <th style={{ width: '100px' }} className="text-end pe-3">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted py-4">
                                        <div className="spinner-border spinner-border-sm me-2"></div>
                                        กำลังโหลดข้อมูลเอกสาร...
                                    </td>
                                </tr>
                            ) : filteredDocuments.length > 0 ? (
                                filteredDocuments.map((doc, index) => (
                                    <tr key={index}>
                                        <td className="text-muted small">{index + 1}</td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-file-earmark-pdf text-danger me-2 fs-5"></i>
                                                <span className="fw-medium text-dark">{doc.filename}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge bg-secondary bg-opacity-10 text-secondary">
                                                {doc.chunks} ส่วน
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge bg-success bg-opacity-10 text-success">
                                                ใช้งานจริง (Live)
                                            </span>
                                        </td>
                                        <td className="text-end pe-3">
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => handleDelete(doc.filename)}
                                                title="ลบเอกสาร"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted py-5">
                                        {searchTerm ? 'ไม่พบชื่อเอกสารที่ตรงกัน' : 'ยังไม่มีเอกสารในคลังความรู้'}
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
