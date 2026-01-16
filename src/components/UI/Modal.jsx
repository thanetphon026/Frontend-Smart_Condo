import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, type = 'default' }) => {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Different styles based on type
    const maxWidth = type === 'image' ? '600px' : type === 'large' ? '800px' : '500px';

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: '1rem'
        }} onClick={onClose}>
            <div className="modal-content-custom bg-white rounded-3 shadow" style={{
                width: '100%',
                maxWidth: maxWidth,
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="modal-header p-3 border-bottom d-flex justify-content-between align-items-center">
                    <h5 className="modal-title m-0 fw-bold text-secondary">{title}</h5>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={onClose}
                        aria-label="Close"
                    ></button>
                </div>

                {/* Body */}
                <div className="modal-body p-3" style={{ overflowY: 'auto' }}>
                    {children}
                </div>

                {/* Footer (Optional) */}
                {type !== 'image' && (
                    <div className="modal-footer p-3 border-top text-end">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            ปิด
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
