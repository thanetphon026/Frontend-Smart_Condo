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
            // Primary Data (Dashboard)
            const [stats] = await Promise.all([
                apiService.getDashboardStats().catch(e => ({ data: {} }))
            ]);

            setData(prev => ({
                ...prev,
                stats: stats?.data || {},
                serverTime: new Date()
            }));
            setError(null);

            // Fetch secondary data immediately
            fetchSecondaryData();

        } catch (err) {
            console.error("Essential Data Fetch Error:", err);
            setError("ไม่สามารถโหลดข้อมูลได้");
        } finally {
            setLoading(false);
        }
    }, []);

    const [secondaryLoading, setSecondaryLoading] = useState(true);

    // Load secondary data
    const fetchSecondaryData = useCallback(async () => {
        setSecondaryLoading(true);
        try {
            // Load Parcels
            const parcelsData = await apiService.getParcels().catch(e => ({ data: [] }));

            // Derive upcoming parcels (pending)
            const allParcels = parcelsData?.data || [];
            const upcoming = allParcels.filter(p => p.status === 'pending');

            setData(prev => ({
                ...prev,
                parcels: allParcels,
                upcomingParcels: upcoming,
                serverTime: new Date()
            }));
        } catch (err) {
            console.error("Secondary Data Fetch Error:", err);
        } finally {
            setSecondaryLoading(false);
        }
    }, []);

    // Load Users
    const fetchUsersData = useCallback(async () => {
        try {
            const usersData = await apiService.getUsers().catch(e => ({ data: [] }));
            setData(prev => ({ ...prev, users: usersData?.data || [] }));
        } catch (err) {
            console.error("Users Data Fetch Error:", err);
        }
    }, []);

    // Load Audit Logs
    const fetchAuditLogs = useCallback(async (type = 'admin') => {
        try {
            const logsData = await apiService.getAuditLogs(type).catch(e => ({ data: [] }));
            setData(prev => ({ ...prev, auditLogs: logsData?.data || [] }));
        } catch (err) {
            console.error("Audit Logs Fetch Error:", err);
        }
    }, []);

    // Refresh Data
    const refreshAllData = useCallback(async () => {
        try {
            const [stats, parcelsData] = await Promise.all([
                apiService.getDashboardStats().catch(e => ({ data: {} })),
                apiService.getParcels().catch(e => ({ data: [] }))
            ]);

            const allParcels = parcelsData?.data || [];
            const upcoming = allParcels.filter(p => p.status === 'pending');

            setData(prev => ({
                ...prev,
                stats: stats?.data || prev.stats,
                parcels: allParcels,
                upcomingParcels: upcoming,
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
