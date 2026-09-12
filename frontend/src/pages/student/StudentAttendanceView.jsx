import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentPortalService } from '../../services/studentPortalService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import {
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  BarChart2,
  Clock,
} from 'lucide-react';

export const StudentAttendanceView = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (!user?.studentId) {
      setLoading(false);
      return;
    }
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await studentPortalService.getAttendance();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load attendance:', err);
        setError('Failed to load attendance record.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user?.studentId]);

  if (!user?.studentId) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Attendance Records Pending</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Your account is currently awaiting administrator review and linking to your student profile. Once linked, your class attendance roster and records will display here.
          </p>
          <div className="pt-2">
            <Link
              to="/student/dashboard"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 shadow-xs transition-colors"
            >
              <span>View Registration Request Status</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Retrieving attendance records..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
        <p className="text-sm font-semibold text-rose-600">{error || 'Attendance records unavailable.'}</p>
      </div>
    );
  }

  const { summary, subjectWise, history } = data;
  const isLow = summary?.isLowAttendance;

  const filteredHistory = (history || []).filter((item) => {
    const matchSearch =
      !search ||
      item.subjectName?.toLowerCase().includes(search.toLowerCase()) ||
      item.subjectCode?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Record & Logs</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Detailed breakdown of your session attendance across all enrolled courses
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Rate</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`text-3xl font-extrabold ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
              {summary?.attendancePercentage || 0}%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Minimum 75% required</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Classes Attended</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-600">
              {summary?.presentCount || 0}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Present in lecture sessions</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Classes Missed</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-rose-600">
              {summary?.absentCount || 0}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Absences recorded</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sessions</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {summary?.totalClasses || 0}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Semester classes held to date</p>
        </div>
      </div>

      {/* Warning Alert if Low */}
      {isLow && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center space-x-3 text-rose-800 text-xs shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>
            <strong>Warning:</strong> Your aggregate attendance is <strong>{summary?.attendancePercentage}%</strong> (below 75%). Make sure to attend all upcoming lectures to avoid academic penalty.
          </span>
        </div>
      )}

      {/* Subject-wise Breakdown Cards */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Subject-wise Breakdown</h3>
            <p className="text-xs text-slate-400">Attendance percentages per individual registered course</p>
          </div>
          <BarChart2 className="w-5 h-5 text-slate-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(subjectWise || []).map((sub) => {
            const subLow = sub.attendancePercentage < 75.0 && sub.totalClasses > 0;
            return (
              <div
                key={sub.subjectId}
                className={`p-4 rounded-2xl border transition-all ${
                  subLow ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100 bg-slate-50/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{sub.subjectName}</h4>
                    <span className="text-2xs font-mono text-slate-400">{sub.subjectCode}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                      subLow ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {sub.attendancePercentage}%
                  </span>
                </div>

                <div className="mt-3 w-full bg-slate-200/60 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${subLow ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(sub.attendancePercentage, 100)}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-2xs text-slate-500 font-medium">
                  <span>{sub.presentCount} attended</span>
                  <span>{sub.absentCount} missed</span>
                  <span>{sub.totalClasses} total</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Chronological History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Session Attendance Log</h3>
            <p className="text-xs text-slate-400">Complete historical record of recorded class dates</p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present Only</option>
              <option value="ABSENT">Absent Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-2xs uppercase tracking-wider font-semibold">
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Subject</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Remarks</th>
                <th className="py-3 px-6 text-right">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    No attendance records match your search filter.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-6 font-mono text-slate-800 font-medium">
                      {item.attendanceDate}
                    </td>
                    <td className="py-3 px-6">
                      <p className="font-semibold text-slate-900">{item.subjectName}</p>
                      <span className="font-mono text-2xs text-slate-400">{item.subjectCode}</span>
                    </td>
                    <td className="py-3 px-6">
                      <Badge variant={item.status}>{item.status}</Badge>
                    </td>
                    <td className="py-3 px-6 text-slate-500 italic">
                      {item.remarks || '-'}
                    </td>
                    <td className="py-3 px-6 text-right text-slate-500 text-xs">
                      {item.recordedByName || 'Faculty'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceView;
