import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentPortalService } from '../../services/studentPortalService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import {
  GraduationCap,
  CalendarCheck,
  Award,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Clock,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  RotateCw,
  ShieldCheck,
  Lock,
  User,
  Building2,
  HelpCircle,
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user, refreshUser } = useAuth();
  const { success, info } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const fetchDashboard = async (isInitial = false) => {
    if (!user?.studentId) {
      setLoading(false);
      return;
    }
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError('');
      const res = await studentPortalService.getDashboard();
      if (res.success && res.data) {
        setData(res.data);
        setSecondsAgo(0);
      }
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
      if (isInitial) {
        setError(err.response?.data?.message || 'Failed to load your student dashboard.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard(true);

    // If student is approved, poll dashboard every 10s
    // If student is pending approval, poll status every 5s to unlock automatically!
    const pollInterval = setInterval(async () => {
      if (!user?.studentId) {
        try {
          const updated = await refreshUser();
          if (updated?.studentId) {
            success('Your registration has been approved! Unlocking portal...');
          }
        } catch (e) {}
      } else {
        fetchDashboard(false);
      }
    }, user?.studentId ? 10000 : 5000);

    const timerInterval = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(timerInterval);
    };
  }, [user?.studentId]);

  const handleCheckStatus = async () => {
    setCheckingStatus(true);
    try {
      const updated = await refreshUser();
      if (updated?.studentId) {
        success('Great news! Your student profile has been approved and enrolled by the administrator.');
        fetchDashboard(true);
      } else {
        info('Your registration request is still pending administrator review. Please check back shortly.');
      }
    } catch (err) {
      console.error('Error checking status:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your academic portal..." />
      </div>
    );
  }

  if (!user?.studentId || error || !data) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-4">
        {/* Main Status Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 p-8 text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending Administrator Approval</span>
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-white mt-2">
                  Registration Submitted — Pending Approval
                </h2>
                <p className="text-sm text-amber-100 max-w-lg">
                  Welcome, <span className="font-semibold">{user?.fullName || 'Student'}</span>. Your registration has been submitted to the College Administration for approval. Once approved, your student dashboard and courses will automatically unlock.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCheckStatus}
                disabled={checkingStatus}
                className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-white text-slate-900 font-bold text-sm shadow-md hover:bg-amber-50 transition-all cursor-pointer disabled:opacity-60 flex-shrink-0"
              >
                <RotateCw className={`w-4 h-4 text-brand-600 ${checkingStatus ? 'animate-spin' : ''}`} />
                <span>{checkingStatus ? 'Checking...' : 'Check Approval Status'}</span>
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* 3-Step Approval Process Tracker */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Admission & Activation Tracker
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                  <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Step 1: Application Submitted</span>
                  </div>
                  <p className="text-xs text-emerald-800">
                    Registration received with your departmental choice.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-400/80 shadow-xs relative">
                  <div className="flex items-center space-x-2 text-amber-800 font-bold text-sm mb-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                    <span>Step 2: Admin Approval</span>
                  </div>
                  <p className="text-xs text-amber-900">
                    Administrator reviews and officially approves your student admission.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-2 text-slate-400 font-semibold text-sm mb-1">
                    <Lock className="w-4 h-4" />
                    <span>Step 3: Portal Active</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Student profile, attendance, marks, and subjects automatically unlock.
                  </p>
                </div>
              </div>
            </div>

            {/* Applicant Summary Details */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Submitted Application Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-400 text-xs block">Full Name</span>
                  <span className="font-semibold text-slate-900">{user?.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Email Address</span>
                  <span className="font-semibold text-slate-900">{user?.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Username</span>
                  <span className="font-mono text-slate-700">@{user?.username}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Assigned / Selected Department</span>
                  <span className="font-semibold text-brand-700">
                    {user?.departmentName ? `${user.departmentName} (${user.departmentCode || ''})` : 'Under Review'}
                  </span>
                </div>
              </div>
            </div>

            {/* Help / Action Note */}
            <div className="flex items-start space-x-3 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900">
              <HelpCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Need immediate assistance?</span> The college administrative office processes student linking requests during working hours. Once linked, click <strong>"Check Status"</strong> above or refresh this page to instantly enter your academic portal.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { student, attendance, academics, recentMarks, recentAttendance } = data;
  const isLowAtt = attendance?.isLowAttendance;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Real-time Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-slate-800 tracking-tight">Real-Time Academic Sync Active</span>
          <span className="text-xs text-slate-400">
            • Updated {secondsAgo <= 2 ? 'just now' : `${secondsAgo}s ago`}
          </span>
        </div>

        <button
          onClick={() => fetchDashboard(false)}
          disabled={isRefreshing}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          title="Refresh marks and attendance"
        >
          <RotateCw className={`w-3.5 h-3.5 text-brand-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Live Sync'}</span>
        </button>
      </div>

      {/* Personalized Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-700 text-white p-6 sm:p-10 shadow-lg shadow-brand-500/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-brand-100 border border-white/10">
              <GraduationCap className="w-4 h-4" />
              <span>Student Academic Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {student?.firstName} {student?.lastName}!
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-brand-100/90 font-medium">
              <span className="bg-white/10 px-2.5 py-0.5 rounded-lg font-mono text-xs">
                Roll No: {student?.studentId}
              </span>
              <span>•</span>
              <span>{student?.courseName || 'Program Enrolled'}</span>
              <span>•</span>
              <span>Semester {student?.semester}</span>
              <span>•</span>
              <span>Year {student?.academicYear}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/student/profile"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white text-brand-700 hover:bg-brand-50 text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <span>View Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Decorative background blurs */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute left-1/2 -top-12 w-48 h-48 rounded-full bg-indigo-400/20 blur-xl pointer-events-none" />
      </div>

      {/* Low Attendance Alert Banner */}
      {isLowAtt && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start space-x-4 animate-fade-in shadow-xs">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-600 flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-rose-900">
              Low Attendance Warning ({attendance?.attendancePercentage}%)
            </h4>
            <p className="text-xs text-rose-700 mt-1 leading-relaxed">
              Your overall attendance has fallen below the mandatory university threshold of <strong>75.0%</strong>. 
              Students with attendance lower than 75% are ineligible to sit for semester examinations. 
              Please contact your course advisor or faculty immediately.
            </p>
          </div>
          <Link
            to="/student/attendance"
            className="flex-shrink-0 text-xs font-bold text-rose-800 bg-rose-200/70 hover:bg-rose-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Review Log
          </Link>
        </div>
      )}

      {/* 4 Personal KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Attendance Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
            <div className={`p-2 rounded-xl ${isLowAtt ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className={`text-3xl font-extrabold ${isLowAtt ? 'text-rose-600' : 'text-slate-900'}`}>
              {attendance?.attendancePercentage || 0}%
            </span>
            <span className="text-xs text-slate-500 font-medium">overall</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {attendance?.presentCount || 0} of {attendance?.totalClasses || 0} classes attended
          </p>
          <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isLowAtt ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(attendance?.attendancePercentage || 0, 100)}%` }}
            />
          </div>
        </div>

        {/* Academic GPA Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Academic Score</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {academics?.averagePercentage || 0}%
            </span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              GPA {academics?.gpa ? academics.gpa.toFixed(1) : '0.0'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Across {academics?.evaluatedSubjectsCount || 0} graded subjects
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>Good Academic Standing</span>
          </div>
        </div>

        {/* Enrolled Curriculum Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Curriculum</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {academics?.enrolledSubjectsCount || 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">Active Subjects</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {academics?.totalCredits || 0} Total Course Credits
          </p>
          <div className="mt-4">
            <Link
              to="/student/subjects"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center space-x-1"
            >
              <span>View Curriculum</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Enrollment Status Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrollment</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <Badge variant={student?.status}>{student?.status}</Badge>
            <span className="text-xs text-slate-400 font-mono">Sem {student?.semester}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 truncate">
            {student?.departmentName || 'General Sciences'}
          </p>
          <div className="mt-4 text-xs text-slate-400">
            Admitted: {student?.admissionDate || 'N/A'}
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Marks & Recent Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 cols: Recent Marks */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Marks & Evaluations</h3>
                <p className="text-xs text-slate-400">Latest grading and semester assessments</p>
              </div>
              <Link
                to="/student/marks"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center space-x-1"
              >
                <span>Full Transcript</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {(recentMarks || []).length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No marks recorded yet for this semester.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-2xs uppercase tracking-wider font-semibold">
                      <th className="pb-3">Subject</th>
                      <th className="pb-3 text-center">Internal (20)</th>
                      <th className="pb-3 text-center">Assignment (20)</th>
                      <th className="pb-3 text-center">Exam (60)</th>
                      <th className="pb-3 text-center">Total (100)</th>
                      <th className="pb-3 text-right">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {recentMarks.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3">
                          <p className="font-semibold text-slate-900">{m.subjectName}</p>
                          <span className="font-mono text-2xs text-slate-400">{m.subjectCode}</span>
                        </td>
                        <td className="py-3 text-center text-slate-600 font-mono">{m.internalMarks ?? '-'}</td>
                        <td className="py-3 text-center text-slate-600 font-mono">{m.assignmentMarks ?? '-'}</td>
                        <td className="py-3 text-center text-slate-600 font-mono">{m.examMarks ?? '-'}</td>
                        <td className="py-3 text-center font-bold text-slate-900 font-mono">
                          {m.totalMarks ?? '-'}
                        </td>
                        <td className="py-3 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-xs ${
                            m.grade === 'A+' || m.grade === 'A'
                              ? 'bg-emerald-50 text-emerald-700'
                              : m.grade === 'B'
                              ? 'bg-blue-50 text-blue-700'
                              : m.grade === 'C'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}>
                            {m.grade || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Grading scale: A+ (90+), A (80+), B (70+), C (60+), D (50+), F (&lt;50)</span>
            <Link to="/student/marks" className="font-semibold text-brand-600 hover:underline">
              View details
            </Link>
          </div>
        </div>

        {/* Right 5 cols: Recent Attendance Activity */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Attendance</h3>
                <p className="text-xs text-slate-400">Class sessions recorded</p>
              </div>
              <Link
                to="/student/attendance"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center space-x-1"
              >
                <span>Full Log</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {(recentAttendance || []).length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No attendance logs found.
              </div>
            ) : (
              <div className="space-y-3">
                {recentAttendance.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-xs font-semibold text-slate-800 truncate">{a.subjectName}</p>
                      <div className="flex items-center space-x-2 text-2xs text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{a.attendanceDate}</span>
                        {a.subjectCode && <span>• {a.subjectCode}</span>}
                      </div>
                    </div>
                    <div>
                      <Badge variant={a.status}>{a.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Threshold required: 75.0%</span>
            <Link to="/student/attendance" className="font-semibold text-brand-600 hover:underline">
              Check breakdown
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
