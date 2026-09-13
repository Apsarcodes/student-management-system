import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { userService } from '../services/userService';
import StatCard from '../components/common/StatCard';
import BarChartCard from '../components/charts/BarChartCard';
import DonutChartCard from '../components/charts/DonutChartCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import {
  Users,
  UserCheck,
  Building2,
  BookOpen,
  CalendarCheck,
  AlertTriangle,
  UserPlus,
  ClipboardCheck,
  Award,
  FileSpreadsheet,
  ArrowRight,
  RotateCw,
  ShieldCheck,
  Activity,
  Sparkles,
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const fetchStats = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      const res = await dashboardService.getStats();
      if (res.success && res.data) {
        setStats(res.data);
        if (res.data.pendingRequestsCount !== undefined) {
          setPendingRequestsCount(res.data.pendingRequestsCount);
        }
        setSecondsAgo(0);
      }

      if (user?.role === 'ADMIN') {
        try {
          const reqRes = await userService.getPendingStudents();
          if (reqRes.success && reqRes.data) {
            setPendingRequestsCount(reqRes.data.length);
          }
        } catch (e) {
          console.warn('Failed to load pending student requests:', e);
        }
      }
      setError(null);
    } catch (err) {
      console.error(err);
      if (isInitial) {
        setError('Failed to load dashboard metrics. Please check API connection.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats(true);

    // Dynamic auto-polling: background live sync every 8 seconds
    const pollInterval = setInterval(() => {
      fetchStats(false);
    }, 8000);

    // Live second counter timer
    const timerInterval = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(timerInterval);
    };
  }, []);

  if (loading) {
    return (
      <div className="py-20">
        <LoadingSpinner size="lg" text="Loading dashboard metrics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center">
        <p className="text-sm font-semibold text-rose-800">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-3 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pending Student Registration Requests Alert */}
      {user?.role === 'ADMIN' && pendingRequestsCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                {pendingRequestsCount} Pending Approval{pendingRequestsCount > 1 ? 's' : ''} Awaiting Review
              </h4>
              <p className="text-xs text-amber-800">
                New student and staff registrations are waiting for administrative review and activation.
              </p>
            </div>
          </div>
          <Link
            to="/users?tab=requests"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex-shrink-0"
          >
            <span>Review Requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-700 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-brand-500/10">
        <div>
          <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            {user?.role === 'STAFF' && user?.departmentCode
              ? `${user.departmentCode} Department Overview`
              : 'Institution Overview'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.fullName || 'Administrator'}!
          </h2>
          <p className="mt-1 text-sm text-brand-100 max-w-xl">
            {user?.role === 'STAFF'
              ? `Monitor student enrollments, academic performance, and attendance records for the ${user?.departmentName || 'assigned'} department.`
              : 'Here is what is happening across your institution today. Monitor enrollments, attendance, and student performance in real-time.'}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/students/new"
            className="flex items-center space-x-2 px-4 py-2.5 bg-white text-brand-700 hover:bg-brand-50 rounded-xl font-semibold text-xs shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </Link>
          <Link
            to="/attendance"
            className="flex items-center space-x-2 px-4 py-2.5 bg-brand-500/30 hover:bg-brand-500/50 text-white border border-white/20 rounded-xl font-semibold text-xs transition-all backdrop-blur-xs"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Attendance</span>
          </Link>
          <Link
            to="/marks"
            className="flex items-center space-x-2 px-4 py-2.5 bg-brand-500/30 hover:bg-brand-500/50 text-white border border-white/20 rounded-xl font-semibold text-xs transition-all backdrop-blur-xs"
          >
            <Award className="w-4 h-4" />
            <span>Marks</span>
          </Link>
        </div>
      </div>

      {/* Real-time Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-slate-800 tracking-tight">Live Real-Time Data Active</span>
          <span className="text-xs text-slate-400">
            • Updated {secondsAgo <= 2 ? 'just now' : `${secondsAgo}s ago`}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {stats?.todayAttendanceCount !== undefined && stats.todayAttendanceCount > 0 && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {stats.todayAttendanceCount} attendance entries today
            </span>
          )}
          <button
            onClick={() => fetchStats(false)}
            disabled={isRefreshing}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            title="Force immediate recalculation against live database"
          >
            <RotateCw className={`w-3.5 h-3.5 text-brand-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Live Sync'}</span>
          </button>
        </div>
      </div>

      {/* 6 to 8 Key Performance Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon={Users}
          color="blue"
          trend={stats?.totalStudents > 0 ? `${Math.round(((stats?.activeStudents || 0) / stats.totalStudents) * 100)}% Active` : undefined}
          subtitle={user?.role === 'STAFF' ? "In your department" : "Registered across all faculties"}
        />
        <StatCard
          title="Active Students"
          value={stats?.activeStudents || 0}
          icon={UserCheck}
          color="green"
          trend="Live Enrolled"
          subtitle="In regular academic standing"
        />
        <StatCard
          title={user?.role === 'STAFF' ? "Assigned Department" : "Departments"}
          value={user?.role === 'STAFF' ? (user?.departmentCode || 'Dept') : (stats?.totalDepartments || 0)}
          icon={Building2}
          color="purple"
          trend={user?.role === 'STAFF' ? "Scoped Isolation" : "University Faculties"}
          subtitle={user?.role === 'STAFF' ? (user?.departmentName || 'Assigned Department') : "Academic divisions"}
        />
        <StatCard
          title={user?.role === 'STAFF' ? "Department Courses" : "Courses Offered"}
          value={stats?.totalCourses || 0}
          icon={BookOpen}
          color="blue"
          trend={stats?.totalSubjectsCount ? `${stats.totalSubjectsCount} Subjects` : undefined}
          subtitle={user?.role === 'STAFF' ? "Offered in your department" : "Undergraduate & Postgraduate"}
        />
        <StatCard
          title="Avg Attendance"
          value={`${stats?.averageAttendancePercentage || 0}%`}
          icon={CalendarCheck}
          color={(stats?.averageAttendancePercentage || 0) >= 75 ? "green" : "amber"}
          trend={(stats?.averageAttendancePercentage || 0) >= 75 ? "Healthy (≥75%)" : "At Risk (<75%)"}
          subtitle="Across active classroom sessions"
        />
        <StatCard
          title="Low Attendance"
          value={stats?.lowAttendanceCount || 0}
          icon={AlertTriangle}
          color={(stats?.lowAttendanceCount || 0) > 0 ? "red" : "green"}
          trend={(stats?.lowAttendanceCount || 0) > 0 ? "Action Required" : "Zero At-Risk"}
          subtitle="Below 75% minimum threshold"
        />
        {user?.role === 'ADMIN' && (
          <>
            <StatCard
              title="Pending Approvals"
              value={pendingRequestsCount}
              icon={UserPlus}
              color={pendingRequestsCount > 0 ? "amber" : "green"}
              trend={pendingRequestsCount > 0 ? "Awaiting Action" : "All Processed"}
              subtitle="Student registration queue"
            />
            <StatCard
              title="Faculty & Staff"
              value={stats?.totalFacultyCount || 0}
              icon={ShieldCheck}
              color="purple"
              trend="Instructors"
              subtitle="Registered faculty members"
            />
          </>
        )}
      </div>

      {/* 4 Interactive Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartCard
          title={user?.role === 'STAFF' ? "Students by Course" : "Students by Department"}
          data={stats?.studentsByDepartment || []}
          emptyText="No enrollment data yet"
        />
        <DonutChartCard
          title="Attendance Breakdown (Present vs Absent)"
          data={stats?.attendanceOverview || []}
          emptyText="No attendance sessions recorded yet"
        />
        <DonutChartCard
          title="Grade Distribution"
          data={stats?.gradeDistribution || []}
          emptyText="No exam marks published yet"
        />
        <BarChartCard
          title="Student Status Distribution"
          data={stats?.statusDistribution || []}
          emptyText="No status records found"
        />
      </div>

      {/* Recent Admissions Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Student Admissions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Latest students enrolled in the system</p>
          </div>
          <Link
            to="/students"
            className="flex items-center space-x-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            <span>View All Students</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-6">Student</th>
                <th className="py-3 px-6">Department</th>
                <th className="py-3 px-6">Course</th>
                <th className="py-3 px-6">Year / Sem</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {stats?.recentStudents?.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-bold flex items-center justify-center text-xs">
                        {s.firstName?.charAt(0)}{s.lastName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{s.fullName}</p>
                        <p className="text-xs text-slate-400">{s.studentId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 text-slate-700 font-medium text-xs">{s.departmentName}</td>
                  <td className="py-3.5 px-6 text-slate-600 text-xs">{s.courseName}</td>
                  <td className="py-3.5 px-6 text-slate-600 text-xs">Year {s.academicYear}, Sem {s.semester}</td>
                  <td className="py-3.5 px-6">
                    <Badge variant={s.status}>{s.status}</Badge>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <Link
                      to={`/students/${s.id}`}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
