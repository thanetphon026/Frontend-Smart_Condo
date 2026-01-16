import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

const ConnectionChecker = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const result = await apiService.testConnection();
      setIsConnected(result.connected);
      
      if (!result.connected) {
        console.error('Connection failed:', result);
      }
    } catch (error) {
      setIsConnected(false);
      console.error('Connection check error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check connection on mount
    checkConnection();
    
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (isConnected) return null;

  return (
    <div className="alert alert-warning alert-dismissible fade show mb-0 rounded-0" role="alert">
      <div className="d-flex align-items-center">
        <i className="bi bi-wifi-off me-2"></i>
        <div className="flex-grow-1">
          <strong>การเชื่อมต่อมีปัญหา!</strong> ระบบไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้
        </div>
        <button 
          type="button" 
          className="btn btn-sm btn-outline-warning"
          onClick={checkConnection}
          disabled={isChecking}
        >
          {isChecking ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              กำลังตรวจสอบ...
            </>
          ) : 'ลองใหม่'}
        </button>
      </div>
    </div>
  );
};

export default ConnectionChecker;