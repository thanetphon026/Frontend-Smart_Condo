import React from 'react';

const ImageModal = ({ isOpen, onClose, imageUrl, title = 'รูปพัสดุ' }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body text-center p-0">
            <img 
              src={imageUrl} 
              className="img-fluid rounded" 
              alt="preview" 
              style={{ maxHeight: '70vh', objectFit: 'contain' }}
            />
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              ปิด
            </button>
            <a 
              href={imageUrl} 
              className="btn btn-primary" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <i className="bi bi-box-arrow-up-right me-1"></i>
              เปิดในแท็บใหม่
            </a>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </div>
  );
};

export default ImageModal;