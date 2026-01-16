import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { usePolling } from '../hooks/usePolling';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [data, setData] = useState({
        stats: {},
        activities: [],
        upcomingParcels: [],
        complaints: [],
        parcels: [],
        users: [],
        auditLogs: [],
        serverTime: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load all data in parallel for maximum speed
    const fetchEssentialData = useCallback(async () => {
        setLoading(true);

        try {
            // Primary Data (Dashboard) - ONLY load what's needed
            const [stats, activityData] = await Promise.all([
                apiService.getDashboardStats().catch(e => ({})),
                apiService.getActivity().catch(e => ({ activities: [] }))
            ]);

            setData(prev => ({
                ...prev,
                stats: stats || {},
                activities: activityData?.activities || [],
                serverTime: new Date()
            }));
            setError(null);

            // โหลด secondary data หลังจาก essential data เสร็จ
            fetchSecondaryData();

        } catch (err) {
            console.error("Essential Data Fetch Error:", err);
            setError("ไม่สามารถโหลดข้อมูลได้");
        } finally {
            setLoading(false);
        }
    }, []);

    const [secondaryLoading, setSecondaryLoading] = useState(true);

    // Load secondary data in background - OPTIMIZED: ลดจาก 4 เหลือ 2
    const fetchSecondaryData = useCallback(async () => {
        setSecondaryLoading(true);
        try {
            // โหลดเฉพาะข้อมูลที่จำเป็น: Complaints และ Parcels
            const [complaintsData, parcelsData] = await Promise.all([
                apiService.getComplaints('all', 'time:desc').catch(e => ({ items: [] })),
                apiService.getParcels().catch(e => ({ items: [] }))
            ]);

            setData(prev => ({
                ...prev,
                complaints: complaintsData?.items || [],
                parcels: parcelsData?.items || [],
                serverTime: new Date()
            }));
        } catch (err) {
            console.error("Secondary Data Fetch Error:", err);
        } finally {
            setSecondaryLoading(false);
        }
    }, []);

    // โหลด Users และ Audit Logs แยกต่างหาก (เฉพาะตอนเข้าหน้านั้นๆ)
    const fetchUsersData = useCallback(async () => {
        try {
            const usersData = await apiService.searchUsers('').catch(e => ({ items: [] }));
            setData(prev => ({ ...prev, users: usersData?.items || [] }));
        } catch (err) {
            console.error("Users Data Fetch Error:", err);
        }
    }, []);

    const fetchAuditLogs = useCallback(async () => {
        try {
            const logsData = await apiService.getAuditLogs().catch(e => ({ logs: [] }));
            setData(prev => ({ ...prev, auditLogs: logsData?.logs || [] }));
        } catch (err) {
            console.error("Audit Logs Fetch Error:", err);
        }
    }, []);

    // Background refresh ONLY essential data (ไม่รีเฟรช users กับ logs ทุกครั้ง)
    const refreshAllData = useCallback(async () => {
        try {
            // โหลดเฉพาะข้อมูลที่เปลี่ยนบ่อย
            const [
                stats,
                activityData,
                complaintsData,
                parcelsData
            ] = await Promise.all([
                apiService.getDashboardStats().catch(e => ({})),
                apiService.getActivity().catch(e => ({ activities: [] })),
                apiService.getComplaints('all', 'time:desc').catch(e => ({ items: [] })),
                apiService.getParcels().catch(e => ({ items: [] }))
            ]);

            setData(prev => ({
                ...prev,
                stats: stats || prev.stats,
                activities: activityData?.activities || prev.activities,
                complaints: complaintsData?.items || prev.complaints,
                parcels: parcelsData?.items || prev.parcels,
                serverTime: new Date()
            }));
        } catch (err) {
            console.error("Refresh Data Error:", err);
        }
    }, []);

    useEffect(() => {
        fetchEssentialData();
    }, [fetchEssentialData]);

    // Global Polling (Every 3 seconds - balanced real-time)
    const { startPolling, stopPolling } = usePolling(() => {
        refreshAllData();
    }, 3000, [refreshAllData]);

    useEffect(() => {
        startPolling();
        return () => stopPolling();
    }, [startPolling, stopPolling]);

    const value = {
        ...data,
        loading,
        secondaryLoading,
        error,
        refreshData: refreshAllData,
        fetchUsersData,  // เพิ่ม: ให้หน้า Users เรียกเอง
        fetchAuditLogs   // เพิ่ม: ให้หน้า Audit Logs เรียกเอง
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
