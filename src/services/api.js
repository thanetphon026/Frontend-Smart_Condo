const API_BASE = import.meta.env.VITE_API_BASE;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

class ApiService {
  constructor() {
    this.baseUrl = API_BASE;
    this.token = API_TOKEN;
    this.sessionToken = null;
    this.adminName = null;
  }

  setSessionToken(token) {
    this.sessionToken = token;
    localStorage.setItem('session_token', token);
  }

  setAdminName(name) {
    this.adminName = name;
    // Update admin data in localStorage if it exists
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      const admin = JSON.parse(adminData);
      admin.name = name;
      localStorage.setItem('admin', JSON.stringify(admin));
    }
  }

  getSessionToken() {
    return this.sessionToken || localStorage.getItem('session_token');
  }

  clearSession() {
    this.sessionToken = null;
    this.adminName = null;
    localStorage.removeItem('session_token');
    localStorage.removeItem('admin');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('lastTab');
  }

  getHeaders(hasBody = true, isFormData = false) {
    const headers = {
      'X-API-Token': this.token,
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true' // บล็อกหน้าจอคำเตือนของ ngrok
    };

    // เพิ่ม session token ถ้ามี
    const sessionToken = this.getSessionToken();
    if (sessionToken) {
      headers['X-Session-Token'] = sessionToken;
    }

    // เพิ่ม admin name ถ้ามี
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      try {
        const admin = JSON.parse(adminData);
        if (admin.name) {
          headers['X-Admin-Name'] = encodeURIComponent(admin.name);
        }
      } catch (e) {
        console.error('Error parsing admin data:', e);
      }
    }

    // If body is FormData, let browser set Content-Type
    if (hasBody && !isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    // ✅ แก้ไข: จัดการ /api prefix อย่างปลอดภัยเพื่อป้องกัน URL ซ้ำซ้อน
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const needsApiPrefix = !this.baseUrl.endsWith('/api') && !cleanEndpoint.startsWith('/api');
    const fullUrl = needsApiPrefix ? `${this.baseUrl}/api${cleanEndpoint}` : `${this.baseUrl}${cleanEndpoint}`;

    const config = {
      ...options,
      headers: {
        ...this.getHeaders(
          options.body && (typeof options.body === 'string' || options.body instanceof FormData),
          options.body instanceof FormData
        ),
        ...options.headers
      }
    };

    console.log(`API Request: ${fullUrl}`, config);

    try {
      const response = await fetch(fullUrl, config);

      // Handle non-JSON responses (เช่น CSV exports)
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType && contentType.includes('text/csv')) {
        // สำหรับ CSV exports
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // ดึงชื่อไฟล์จาก header
        const contentDisposition = response.headers.get('content-disposition');
        let filename = 'export.csv';
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+)"/);
          if (match) filename = match[1];
        }

        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();

        return { status: 'success', message: 'Download started' };
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text, status: 'error' };
        }
      }

      if (!response.ok) {
        const errorMessage = data.message || data.error || `HTTP ${response.status}`;

        // ✅ แก้ไข: ถ้าเป็น Unauthorized ให้ clear session
        if (response.status === 401) {
          this.clearSession();
          throw new Error('Session expired. Please login again.');
        }

        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('API Error:', {
        endpoint,
        error: error.message,
        fullUrl
      });

      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      }

      throw error;
    }
  }

  // ✅ แก้ไข: Admin Authentication - ใช้ endpoint ที่ถูกต้อง
  async login(email, password) {
    const result = await this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (result.status === 'success') {
      // Backend might not return session_token, so use API_TOKEN as fallback
      const token = result.session_token || this.token;
      this.setSessionToken(token);

      if (result.admin) {
        this.adminName = result.admin.name;
        localStorage.setItem('admin', JSON.stringify(result.admin));
      }
    }

    return result;
  }

  async verifySession() {
    try {
      // If backend has verify endpoint:
      // return await this.request('/admin/verify');

      // Local fallback if endpoint missing:
      const savedAdmin = localStorage.getItem('admin');
      if (savedAdmin) {
        return { status: 'success', admin: JSON.parse(savedAdmin) };
      }
      throw new Error('No session');
    } catch (error) {
      this.clearSession();
      throw error;
    }
  }

  async logout() {
    try {
      // ✅ รอให้ Server รับทราบการ Logout เพื่อบันทึก Log
      await this.request('/admin/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout API warning:', err);
    } finally {
      // Clear local immediately
      this.clearSession();
      window.location.href = '/login';
    }
  }

  // ✅ แก้ไข: Dashboard endpoints
  async getDashboardStats() {
    return this.request('/dashboard');
  }

  async getActivity() {
    return this.request('/activity');
  }

  async getUpcomingParcels() {
    return this.request('/upcoming-parcels');
  }

  // ✅ แก้ไข: Users endpoints
  async getUsers() {
    return this.request('/users');
  }

  async searchUsers(query) {
    return this.request(`/users/search?q=${encodeURIComponent(query)}`);
  }

  // ✅ แก้ไข: Complaints endpoints (ใช้ตัวที่ optimized เสมอ)
  async getComplaints(status = 'pending', sort = 'priority:desc', search = '') {
    return this.searchComplaints(status, search);
  }

  async searchComplaints(status, query) {
    return this.request(`/complaints/search?status=${status}&q=${encodeURIComponent(query)}`);
  }

  async resolveComplaint(id, formData) {
    return this.request(`/complaints/${id}/resolve`, {
      method: 'POST',
      body: formData
    });
  }

  // ✅ แก้ไข: Parcels endpoints (ใช้ตัวที่ optimized เสมอ)
  async getParcels(search = '') {
    return this.searchParcels(search);
  }

  async searchParcels(query) {
    return this.request(`/parcels/search?q=${encodeURIComponent(query)}`);
  }

  async pickupParcel(pin) {
    return this.request('/pickup', {
      method: 'POST',
      body: JSON.stringify({ pin })
    });
  }

  // ✅ แก้ไข: Scan endpoints
  async scanImage(formData) {
    return this.request('/scan', {
      method: 'POST',
      body: formData
    });
  }

  async confirmParcel(data) {
    return this.request('/confirm', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ✅ แก้ไข: Audit Logs
  async getAuditLogs() {
    return this.request('/admin/audit-logs');
  }

  // ✅ แก้ไข: Export URLs
  getExportComplaintsUrl() {
    const token = this.getSessionToken() || this.token;
    return `${this.baseUrl}/api/admin/export/complaints?token=${token}`;
  }

  getExportParcelsUrl() {
    const token = this.getSessionToken() || this.token;
    return `${this.baseUrl}/api/admin/export/parcels?token=${token}`;
  }

  getExportAfterHoursParcelsUrl() {
    const token = this.getSessionToken() || this.token;
    return `${this.baseUrl}/api/parcels/after-hours/export?token=${token}`;
  }

  // ✅ แก้ไข: Health Check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // ✅ แก้ไข: Test connection
  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return {
        connected: response.ok,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }

  // ✅ เพิ่ม: Chat History
  async getChatHistory(userId) {
    return this.request(`/chat-history/${userId}`);
  }

  // ✅ เพิ่ม: Debug endpoint
  async debugAnalyzeUrgency(description) {
    return this.request('/debug/analyze', {
      method: 'POST',
      body: JSON.stringify({ description })
    });
  }
}

export const apiService = new ApiService();