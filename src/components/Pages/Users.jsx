import React, { useState, useEffect, useCallback } from 'react';
import SearchBox from '../UI/SearchBox';
import { escapeHtml, formatDateTime } from '../../utils/helpers';
import { useData } from '../../contexts/DataContext';

const Users = () => {
  const { users: allUsers, loading: globalLoading, secondaryLoading, fetchUsersData } = useData();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Sync loading
  useEffect(() => {
    setLoading(globalLoading || secondaryLoading);
  }, [globalLoading, secondaryLoading]);

  // Fetch initial data
  useEffect(() => {
    fetchUsersData();
  }, [fetchUsersData]);

  // Client-side filtering
  const applyFilters = useCallback((data, term) => {
    if (!data) return;
    if (!term || term.trim() === '') {
      setUsers(data);
      return;
    }
    const lowerTerm = term.toLowerCase().trim();
    const filtered = data.filter(user =>
      (user.room_number && user.room_number.toLowerCase().includes(lowerTerm)) ||
      (user.name && user.name.toLowerCase().includes(lowerTerm)) ||
      (user.display_name && user.display_name.toLowerCase().includes(lowerTerm)) ||
      (user.phone_number && user.phone_number.toLowerCase().includes(lowerTerm)) ||
      (user.platform && user.platform.toLowerCase().includes(lowerTerm))
    );
    setUsers(filtered);
  }, []);

  // Filter Effect
  useEffect(() => {
    applyFilters(allUsers, searchTerm);
  }, [searchTerm, allUsers, applyFilters]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <div id="users">
      <div className="card-custom mb-3">
        <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
          <div>
            <h5 className="mb-1">ข้อมูลผู้ใช้ทั้งหมด</h5>
            <small className="text-muted">จัดการข้อมูลสมาชิกและห้องพัก</small>
            {!loading && (
              <div className="result-count">
                พบ {users.length} รายการ
              </div>
            )}
          </div>
          <div style={{ maxWidth: '300px', width: '100%' }}>
            <SearchBox
              placeholder="ค้นหาผู้ใช้..."
              onSearch={handleSearch}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>ห้อง</th>
                <th>ชื่อ-นามสกุล</th>
                <th>ชื่อในไลน์</th>
                <th>เบอร์โทร</th>
                <th>แพลตฟอร์ม</th>
                <th>ใช้งานล่าสุด</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    <div className="spinner-border spinner-border-sm me-2"></div>
                    กำลังโหลดข้อมูลผู้ใช้...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={user.id || index}>
                    <td data-label="ห้อง">{escapeHtml(user.room_number || '-')}</td>
                    <td data-label="ชื่อ-นามสกุล">{escapeHtml(user.name || '-')}</td>
                    <td data-label="ชื่อในไลน์">{escapeHtml(user.display_name || '-')}</td>
                    <td data-label="เบอร์โทร">{escapeHtml(user.phone_number || '-')}</td>
                    <td data-label="แพลตฟอร์ม">
                      <span className={`badge ${user.platform?.toLowerCase().includes('line') ? 'bg-success' : 'bg-primary'} bg-opacity-10 ${user.platform?.toLowerCase().includes('line') ? 'text-success' : 'text-primary'}`}>
                        {escapeHtml(user.platform || '-')}
                      </span>
                    </td>
                    <td data-label="ใช้งานล่าสุด" className="text-nowrap">{formatDateTime(user.last_active_at || user.last_active)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    {searchTerm ? 'ไม่พบข้อมูลผู้ใช้ที่ตรงกับการค้นหา' : 'ไม่พบข้อมูลผู้ใช้'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;