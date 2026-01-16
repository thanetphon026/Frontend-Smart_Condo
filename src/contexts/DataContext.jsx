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
        parcels: [],
        users: [],
        auditLogs: [],
        serverTime: null
    });
    const [loading, setLoading] = useState(true);
    const [secondaryLoading, setSecondaryLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeOffset, setTimeOffset] = useState(0); // Offset in ms: Server - Client

    // Sync Time Helper
    const syncTime = (serverTimeStr) => {
        if (serverTimeStr) {
            const serverTime = new Date(serverTimeStr);
            const localTime = new Date();
            const offset = serverTime.getTime() - localTime.getTime();
            setTimeOffset(offset);
            return serverTime;
        }
        return new Date();
    };

    const getNow = useCallback(() => {
        return new Date(Date.now() + timeOffset);
    }, [timeOffset]);

    // Fast Essential Load (Stats + Users count)
    const fetchEssentialData = useCallback(async () => {
        setLoading(true);
        try {
            const stats = await apiService.getDashboardStats().catch(e => ({ data: {} }));
            const serverTime = syncTime(stats?.data?.system_status?.server_time);

            setData(prev => ({
                ...prev,
                stats: stats?.data || {},
                serverTime: serverTime
            }));
            setError(null);

            // Trigger background fetches
            fetchSecondaryData();
            fetchUsersData();
        } catch (err) {
            console.error("Essential Data Fetch Error:", err);
            setError("ไม่สามารถโหลดข้อมูลได้");
        } finally {
            setLoading(false);
        }
    }, []);

    // Load Parcels
    const fetchSecondaryData = useCallback(async () => {
        setSecondaryLoading(true);
        try {
            const parcelsData = await apiService.getParcels().catch(e => ({ data: [] }));
            const allParcels = parcelsData?.data || [];
            const upcoming = allParcels.filter(p => p.status === 'pending');

            setData(prev => ({
                ...prev,
                parcels: allParcels,
                upcomingParcels: upcoming
            }));
        } catch (err) {
            console.error("Secondary Data Fetch Error:", err);
        } finally {
            setSecondaryLoading(false);
        }
    }, []);

    // Load Users (Now part of regular refresh)
    const fetchUsersData = useCallback(async () => {
        try {
            const usersData = await apiService.getUsers().catch(e => ({ data: [] }));
            setData(prev => ({ ...prev, users: usersData?.data || [] }));
        } catch (err) {
            console.error("Users Data Fetch Error:", err);
        }
    }, []);

    // Load Records (Audit Logs)
    const fetchAuditLogs = useCallback(async (type = 'admin') => {
        try {
            const logsData = await apiService.getAuditLogs(type).catch(e => ({ data: [] }));
            setData(prev => ({ ...prev, auditLogs: logsData?.data || [] }));
        } catch (err) {
            console.error("Audit Logs Fetch Error:", err);
        }
    }, []);

    // Global background sync to keep data fresh without resetting UI state
    const refreshAllData = useCallback(async () => {
        try {
            const [stats, parcelsData, usersData] = await Promise.all([
                apiService.getDashboardStats().catch(e => ({ data: {} })),
                apiService.getParcels().catch(e => ({ data: [] })),
                apiService.getUsers().catch(e => ({ data: [] }))
            ]);

            const serverTime = syncTime(stats?.data?.system_status?.server_time);
            const allParcels = parcelsData?.data || [];
            const upcoming = allParcels.filter(p => p.status === 'pending');

            setData(prev => ({
                ...prev,
                stats: stats?.data || prev.stats,
                parcels: allParcels,
                upcomingParcels: upcoming,
                users: usersData?.data || prev.users,
                serverTime: serverTime
            }));
        } catch (err) {
            console.error("Refresh Data Error:", err);
        }
    }, []);

    useEffect(() => {
        fetchEssentialData();
    }, [fetchEssentialData]);

    const { startPolling, stopPolling } = usePolling(() => {
        refreshAllData();
    }, 4000, [refreshAllData]); // 4s sync for optimal performance & freshness

    useEffect(() => {
        startPolling();
        return () => stopPolling();
    }, [startPolling, stopPolling]);

    const value = {
        ...data,
        loading,
        secondaryLoading,
        error,
        getNow,
        refreshData: refreshAllData,
        fetchUsersData,
        fetchAuditLogs
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
