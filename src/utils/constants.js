export const API_CONFIG = {
  BASE_URL: 'https://backend-smart-condo.onrender.com/api',
  TOKEN: '66122519026'
};

export const NAV_ITEMS = [
  { id: 'dashboard', icon: 'bi-speedometer2', label: 'แดชบอร์ด' },
  { id: 'users', icon: 'bi-people', label: 'ข้อมูลผู้ใช้' },
  { id: 'parcels', icon: 'bi-box-seam', label: 'พัสดุคงค้าง' },
  { id: 'scan', icon: 'bi-camera', label: 'สแกนพัสดุ' },
  { id: 'audit-logs', icon: 'bi-clock-history', label: 'ประวัติการทำงาน' },
];

export const HEADER_MAP = {
  dashboard: { title: 'แดชบอร์ด', subtitle: 'ภาพรวมระบบจัดการคอนโดอัจฉริยะ', icon: 'bi-speedometer2' },
  users: { title: 'ข้อมูลผู้ใช้', subtitle: 'จัดการข้อมูลสมาชิกและห้องพัก', icon: 'bi-people' },
  parcels: { title: 'พัสดุคงค้าง', subtitle: 'รายการรอรับของ', icon: 'bi-box-seam' },
  scan: { title: 'สแกนพัสดุ', subtitle: 'ระบบรับพัสดุอัจฉริยะ', icon: 'bi-camera' },
  'audit-logs': { title: 'ประวัติการทำงาน', subtitle: 'ตรวจสอบความโปร่งใสในการปฏิบัติงาน', icon: 'bi-clock-history' }
};

export const PRIORITY_OPTIONS = [
  { value: 'high', label: 'สูง', color: 'text-danger', bg: 'rgba(220, 53, 69, 0.1)' },
  { value: 'medium', label: 'กลาง', color: 'text-warning', bg: 'rgba(255, 193, 7, 0.1)' },
  { value: 'low', label: 'ต่ำ', color: 'text-success', bg: 'rgba(25, 135, 84, 0.1)' }
];

export const STATUS_OPTIONS = [
  { value: 'pending', label: 'รอดำเนินการ', color: 'text-secondary' },
  { value: 'in_progress', label: 'กำลังดำเนินการ', color: 'text-warning' },
  { value: 'resolved', label: 'ดำเนินการเสร็จสิ้น', color: 'text-success' }
];