import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Code Splitting: Load pages only when needed
const LoginPage = lazy(() => import('./pages/LoginPage'));
const BackOfficePage = lazy(() => import('./pages/BackOfficePage'));

// Loading Component
const LoadingFallback = () => (
  <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
    <div className="text-center">
      <div className="spinner-border text-primary mb-3" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <h6 className="text-muted">กำลังโหลดระบบ...</h6>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/backoffice" element={<BackOfficePage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;