import React from 'react';
import Modal from './Modal';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'ยืนยันการดำเนินการ',
    message = 'คุณแน่ใจหรือไม่?',
    confirmText = 'ยืนยัน',
    cancelText = 'ยกเลิก',
    confirmButtonClass = 'btn-success',
    type = 'default'
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} type={type}>
            <div className="text-center py-3">
                <p className="mb-4">{message}</p>
                <div className="d-flex justify-content-center gap-2">
                    <button
                        className="btn btn-secondary px-4"
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`btn ${confirmButtonClass} px-4`}
                        onClick={onConfirm}
                    >
                        <i className="bi bi-check-circle me-2"></i>
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
