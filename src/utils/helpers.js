export const truncateText = (text = '', length = 80) => {
  if (!text || typeof text !== 'string') return '-';
  return text.length > length ? text.slice(0, length) + '...' : text;
};

export const escapeHtml = (str = '') => {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, s => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[s]));
};

export const formatDateTime = (value) => {
  if (!value) return '-';
  try {
    // Backend sends UTC (e.g., 20:00), we want browser to treat it as UTC so converting to Thai time adds +7h (03:00).
    // Without 'Z', browser parses "20:00" as "Local 20:00", resulting in wrong time.
    // Backend now sends ISO 8601 with 'Z' (UTC). Browser handles this natively.
    const d = new Date(value);
    if (isNaN(d.getTime())) return '-';

    return d.toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return '-';
  }
};

export const priorityBadge = (priority) => {
  const level = (priority || 'low').toLowerCase();
  const meta = {
    high: { color: '#b91c1c', bg: 'rgba(185,28,28,0.1)', label: 'สูง', icon: 'bi-exclamation-triangle-fill' },
    medium: { color: '#d97706', bg: 'rgba(217,119,6,0.12)', label: 'กลาง', icon: 'bi-exclamation-circle-fill' },
    low: { color: '#15803d', bg: 'rgba(21,128,61,0.12)', label: 'ต่ำ', icon: 'bi-check-circle-fill' },
  }[level] || { color: '#15803d', bg: 'rgba(21,128,61,0.12)', label: 'ต่ำ', icon: 'bi-check-circle-fill' };

  return meta;
};

export const statusBadge = (status) => {
  const val = (status || 'pending').toLowerCase();
  if (val === 'resolved') return {
    class: 'bg-success bg-opacity-10 text-success',
    text: 'ดำเนินการเสร็จสิ้น',
    icon: 'bi-check-circle-fill'
  };
  if (val === 'in_progress') return {
    class: 'bg-warning bg-opacity-10 text-warning',
    text: 'กำลังดำเนินการ',
    icon: 'bi-hourglass-split'
  };
  return {
    class: 'bg-secondary bg-opacity-10 text-secondary',
    text: 'รอดำเนินการ',
    icon: 'bi-clock'
  };
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const generatePIN = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};