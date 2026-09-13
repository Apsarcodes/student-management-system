import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAdmin } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPendingCount = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await userService.getPendingStudents();
      const list = res.data || (Array.isArray(res) ? res : []);
      setPendingCount(list.length);
    } catch {
      // silent background check
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchPendingCount();

    // Poll every 10 seconds for new registrations
    const interval = setInterval(fetchPendingCount, 10000);

    // Also listen for immediate updates triggered across the app
    window.addEventListener('refreshPendingCount', fetchPendingCount);

    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshPendingCount', fetchPendingCount);
    };
  }, [isAdmin, fetchPendingCount]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingCount={pendingCount}
      />

      <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
        <Header
          onToggleSidebar={() => setSidebarOpen(true)}
          pendingCount={pendingCount}
        />
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
          <div className="w-full min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

