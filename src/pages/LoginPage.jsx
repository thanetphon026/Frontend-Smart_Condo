import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    const savedLoginStatus = localStorage.getItem('isLoggedIn');
    if (savedLoginStatus === 'true') {
      navigate('/backoffice');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting login with:', { email }); // Debug log

      const response = await apiService.login(email, password);
      console.log('Login response:', response); // Debug log

      if (response.status === 'success') {
        // Save admin data
        localStorage.setItem('admin', JSON.stringify(response.admin));
        localStorage.setItem('isLoggedIn', 'true');

        // Set admin name in API service
        apiService.setAdminName(response.admin.name);

        // Navigate to backoffice
        navigate('/backoffice');
      } else {
        setError(response.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (error) {
      console.error('Login error:', error);

      // More specific error messages
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      } else if (error.message.includes('401')) {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else {
        setError(`เกิดข้อผิดพลาด: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-100 relative">
          <div className="h-2 bg-gradient-to-r from-blue-600 to-blue-800 w-full absolute top-0 left-0"></div>



          <div className="pt-10 pb-6 text-center px-6">
            <div className="flex justify-center mb-4">
              <div className="relative w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center ring-4 ring-white shadow-lg">
                <svg className="w-16 h-16 text-primary" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M30 80H70V30L50 15L30 30V80Z" fill="currentColor" opacity="0.2" />
                  <path d="M35 80V35L50 24L65 35V80H35Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="42" y="40" width="6" height="6" rx="1" fill="currentColor" />
                  <rect x="52" y="40" width="6" height="6" rx="1" fill="currentColor" />
                  <rect x="42" y="52" width="6" height="6" rx="1" fill="currentColor" />
                  <rect x="52" y="52" width="6" height="6" rx="1" fill="currentColor" />
                  <rect x="42" y="64" width="6" height="6" rx="1" fill="currentColor" />
                  <rect x="52" y="64" width="6" height="6" rx="1" fill="currentColor" />
                  <path d="M20 80H80" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path d="M65 80C65 80 85 75 85 55C85 45 75 40 75 40" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                  <path d="M75 55C75 55 65 60 65 80" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">ระบบนิติบุคคล</h1>
            <p className="text-gray-500 mt-1 text-sm font-medium">Juristic Management System</p>


          </div>

          <div className="px-8 pb-10">
            <form onSubmit={handleLogin}>
              <div className="mb-5">
                <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 pl-1">
                  อีเมลเจ้าหน้าที่
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 sm:text-sm shadow-sm"
                    placeholder="admin@condo.com"
                    required
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="mb-8">
                <label htmlFor="password" className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 pl-1">
                  รหัสผ่าน
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 sm:text-sm shadow-sm"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <div className="flex items-center">
                    <i className="bi bi-exclamation-triangle-fill mr-2"></i>
                    {error}
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-md hover:shadow-lg transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      กำลังเข้าสู่ระบบ...
                    </>
                  ) : 'เข้าสู่ระบบ'}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-400 whitespace-nowrap">
                &copy; 2025 ระบบจัดการคอนโดมิเนียม • สำหรับเจ้าหน้าที่เท่านั้น
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;