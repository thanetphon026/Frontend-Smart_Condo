import React, { useState } from 'react';
import { apiService } from '../../services/api';

const KnowledgeBase = () => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [isLoadingDocs, setIsLoadingDocs] = useState(true);

    const fetchDocuments = async () => {
        try {
            setIsLoadingDocs(true);
            const docs = await apiService.getDocuments();
            setDocuments(docs);
        } catch (err) {
            console.error("Error fetching documents:", err);
            // Non-blocking error for list
        } finally {
            setIsLoadingDocs(false);
        }
    };

    React.useEffect(() => {
        fetchDocuments();
    }, []);

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
            // Refresh list
            fetchDocuments();
        } catch (err) {
            console.error('Upload Error:', err);
            setError(err.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (filename) => {
        if (!window.confirm(`คุณแน่ใจว่าต้องการลบเอกสาร "${filename}" หรือไม่? ข้อมูลทั้งหมดที่เกี่ยวข้องจะถูกลบออกจากระบบทันที`)) {
            return;
        }

        try {
            await apiService.deleteDocument(filename);
            fetchDocuments(); // Refresh list
            setMessage(`ลบเอกสาร ${filename} เรียบร้อยแล้ว`);
        } catch (err) {
            console.error("Delete error:", err);
            setError(err.message || "เกิดข้อผิดพลาดในการลบเอกสาร");
        }
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12 col-md-8 mx-auto">
                    {/* Upload Card */}
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-primary text-white py-3 border-0">
                            <h5 className="mb-0 fw-bold">
                                <i className="bi bi-robot me-2"></i>
                                คลังความรู้ AI (RAG Management)
                            </h5>
                            <small className="text-white-50">เพิ่มประสิทธิภาพการตอบคำถามลูกบ้านด้วยเอกสารของคุณ</small>
                        </div>
                        <div className="card-body p-4">
                            <div className="alert alert-light border-start border-4 border-info shadow-sm p-3 mb-4">
                                <div className="d-flex">
                                    <div className="me-3">
                                        <i className="bi bi-info-circle-fill text-info h4"></i>
                                    </div>
                                    <div>
                                        <span className="fw-bold text-dark">ระบบ RAG จะใช้ข้อมูลจากไฟล์ PDF ที่คุณอัปโหลด</span>
                                        <span className="d-block text-muted">เช่น คู่มือ, กฎระเบียบ เพื่อให้ AI ตอบคำถามลูกบ้านได้อย่างแม่นยำ การอัปโหลดไฟล์ชื่อเดิมจะแทนที่ข้อมูลเก่าโดยอัตโนมัติ</span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleUpload}>
                                <div className="mb-4">
                                    <div className={`upload-area p-5 border-2 border-dashed rounded-3 text-center ${file ? 'border-primary bg-light' : 'border-secondary-subtle'}`}>
                                        <i className={`bi ${file ? 'bi-file-earmark-pdf-fill text-primary' : 'bi-cloud-arrow-up text-secondary'} display-1 mb-3`}></i>
                                        <h5 className="fw-bold mb-2">
                                            {file ? file.name : 'ลากไฟล์ PDF มาวางที่นี่ หรือ คลิกเพื่อเลือกไฟล์'}
                                        </h5>
                                        <div className="text-muted small">
                                            {file ? `ขนาด: ${(file.size / 1024 / 1024).toFixed(2)} MB` : 'รองรับไฟล์ PDF เท่านั้น, ขนาดไม่เกิน 10MB'}
                                        </div>

                                        <input
                                            id="pdf-upload-input"
                                            type="file"
                                            accept=".pdf"
                                            className="d-none"
                                            onChange={handleFileChange}
                                            disabled={isUploading}
                                        />
                                        <label htmlFor="pdf-upload-input" className="stretched-link"></label>
                                    </div>
                                    {error && <div className="text-danger mt-3 text-center animate__animated animate__shakeX"><i className="bi bi-exclamation-triangle-fill me-1"></i> {error}</div>}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 py-3 fw-bold shadow-sm rounded-pill"
                                    disabled={!file || isUploading}
                                >
                                    {isUploading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            กำลังอัปโหลดและประมวลผล...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-cloud-upload-fill me-2"></i>
                                            เริ่มการอัปโหลดและประมวลผล
                                        </>
                                    )}
                                </button>
                            </form>

                            {message && (
                                <div className="alert alert-success mt-4 border-0 shadow-sm animate__animated animate__fadeIn">
                                    <i className="bi bi-check-circle-fill me-2"></i>
                                    {message}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Document List Card */}
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white py-3 border-bottom">
                            <h6 className="mb-0 fw-bold">รายการเอกสารในระบบ RAG</h6>
                        </div>
                        <div className="card-body p-0">
                            {isLoadingDocs ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : documents.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="bg-light text-secondary">
                                            <tr>
                                                <th className="ps-4">ไฟล์ อัปโหลด</th>
                                                <th>สถานะ</th>
                                                <th>วันที่</th>
                                                <th className="text-end pe-4">จัดการ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {documents.map((doc, index) => (
                                                <tr key={index}>
                                                    <td className="ps-4">
                                                        <div className="d-flex align-items-center">
                                                            <div className="bg-light rounded p-2 me-3">
                                                                <i className="bi bi-file-earmark-pdf-fill text-danger h5 mb-0"></i>
                                                            </div>
                                                            <div>
                                                                <div className="fw-bold text-dark">{doc.filename}</div>
                                                                <small className="text-muted">{doc.chunks} chunks</small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2">
                                                            <i className="bi bi-check-circle-fill me-1"></i> Success
                                                        </span>
                                                    </td>
                                                    <td className="text-muted small">
                                                        {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('th-TH', {
                                                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                        }) : '-'}
                                                    </td>
                                                    <td className="text-end pe-4">
                                                        <button
                                                            className="btn btn-outline-secondary btn-sm me-2"
                                                            title="View (Not implemented)"
                                                            disabled
                                                        >
                                                            <i className="bi bi-eye"></i> View
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => handleDelete(doc.filename)}
                                                            title="Delete"
                                                        >
                                                            <i className="bi bi-trash"></i> Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-5 text-muted">
                                    <i className="bi bi-inbox display-4 mb-3 d-block opacity-25"></i>
                                    ยังไม่มีเอกสารในระบบ
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .border-dashed { border-style: dashed !important; }
                .upload-area { cursor: pointer; transition: all 0.2s; }
                .upload-area:hover { background-color: #f8f9fa; border-color: #0d6efd !important; }
                .bg-success-subtle { background-color: #d1e7dd !important; }
                .text-success { color: #0f5132 !important; }
                .btn-outline-danger:hover { color: #fff; background-color: #dc3545; border-color: #dc3545; }
            `}} />
        </div>
    );
};

export default KnowledgeBase;
