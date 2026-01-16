import React from 'react';

const ModalWrapper = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer, 
  size = 'md',
  centered = true 
}) => {
  if (!isOpen) return null;

  const sizeClass = {
    sm: 'modal-sm',
    md: '',
    lg: 'modal-lg',
    xl: 'modal-xl'
  }[size];

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className={`modal-dialog ${sizeClass} ${centered ? 'modal-dialog-centered' : ''}`}>
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
          <div className="modal-body">
            {children}
          </div>
          {footer && (
            <div className="modal-footer">
              {footer}
            </div>
          )}
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </div>
  );
};

export default ModalWrapper;