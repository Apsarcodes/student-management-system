import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import {
  ArrowLeft,
  Edit2,
  Calendar,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Building2,
  BookOpen,
  Award,
  CalendarCheck,
  AlertTriangle,
  User,
} from 'lucide-react';

export const StudentDetail = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await studentService.getStudentProfile(id);
        if (res.success && res.data) {
          setProfile(res.data);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load student profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner size="lg" text="Loading student record..." />
      </div>
    );
  }

  if (error || !profile?.student) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
        <p className="text-sm font-semibold text-rose-600 mb-4">{error || 'Student not found.'}</p>
        <Link
          to="/students"
          className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
        >
          Back to Students
        </Link>
      </div>
    );
  }

  const { student, attendanceSummary, subjectAttendance, marks } = profile;
  const attendancePct = attendanceSummary?.attendancePercentage || 0;
  const isLowAttendance = attendancePct < 75.0 && (attendanceSummary?.totalClasses || 0) > 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Bar with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/students"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white border border-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Student Profile</h2>
            <p className="text-xs text-slate-400">Complete academic portfolio and performance history</p>
          </div>
        </div>

        <Link
          to={`/students/${student.id}/edit`}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          <span>Edit Profile</span>
        </Link>
      </div>

      {/* Hero Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-brand-500/20">
            {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{student.fullName}</h3>
              <Badge variant={student.status}>{student.status}</Badge>
            </div>
            <p className="text-xs font-mono font-bold text-brand-600 mt-1">{student.studentId}</p>
            <p className="text-xs text-slate-500 mt-1">
              {student.courseName} • Year {student.academicYear}, Semester {student.semester}
            </p>
          </div>
        </div>

        {/* Metric Pills */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="text-center px-4 border-r border-slate-200">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Attendance</p>
            <p className={`text-xl font-extrabold mt-0.5 ${isLowAttendance ? 'text-rose-600' : 'text-emerald-600'}`}>
              {attendancePct}%
            </p>
          </div>
          <div className="text-center px-4">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Subjects</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{marks?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Low Attendance Alert Banner */}
      {isLowAttendance && (
        <div className="flex items-center space-x-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <div>
            <span className="font-bold">Low Attendance Warning:</span> Student attendance is currently at{' '}
            <span className="font-bold">{attendancePct}%</span>, which is below the mandatory 75% institutional requirement.
          </div>
        </div>
      )}

      {/* Info Grid (Personal & Academic) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-brand-600" />
            <h4 className="text-sm font-bold text-slate-900">Personal Information</h4>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs">
            <div>
              <dt className="text-slate-400 font-medium">Full Name</dt>
              <dd className="text-slate-800 font-semibold mt-0.5">{student.fullName}</dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Gender</dt>
              <dd className="text-slate-800 font-semibold mt-0.5">{student.gender}</dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Date of Birth</dt>
              <dd className="text-slate-800 font-semibold mt-0.5">{student.dateOfBirth}</dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Email Address</dt>
              <dd className="text-slate-800 font-semibold mt-0.5 truncate">{student.email}</dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Phone Number</dt>
              <dd className="text-slate-800 font-semibold mt-0.5">{student.phone}</dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Address</dt>
              <dd className="text-slate-800 font-semibold mt-0.5">{student.address || 'N/A'}</dd>
            </div>
          </dl>
        </div>

        {/* Academic Details */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <h4 className="text-sm font-bold text-slate-900">Academic Information</h4>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs">
            <div>
              <dt className="text-slate-400 font-medium">Department</dt>
              <dd className="text-slate-800 font-semibold mt-0.5">{student.departmentName}</dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Course Program</dt>
              <dd className="text-slate-800 font-semibold mt-0.5">{student.courseName}</dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Academic Year</dt>
              <dd className="text-slate-800 font-semibold mt-0.5">Year {student.academicYear}</dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Current Semester</dt>
              <dd className="text-slate-800 font-semibold mt-0.5">Semester {student.semester}</dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Admission Date</dt>
              <dd className="text-slate-800 font-semibold mt-0.5">{student.admissionDate}</dd>
            </div>
            <div>
              <dt className="text-slate-400 font-medium">Status</dt>
              <dd className="mt-0.5">
                <Badge variant={student.status} size="sm">{student.status}</Badge>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Attendance Record Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <CalendarCheck className="w-5 h-5 text-emerald-600" />
              <h4 className="text-base font-bold text-slate-900">Attendance Statistics</h4>
            </div>
            <p className="text-xs text-slate-500 mt-1">Summary of class sessions attended</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="text-slate-600">Total: {attendanceSummary?.totalClasses || 0}</span>
            <span className="text-emerald-600">Present: {attendanceSummary?.presentCount || 0}</span>
            <span className="text-rose-600">Absent: {attendanceSummary?.absentCount || 0}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100">
                <th className="py-3 px-6">Subject Code</th>
                <th className="py-3 px-6">Subject Name</th>
                <th className="py-3 px-6">Total Sessions</th>
                <th className="py-3 px-6">Present</th>
                <th className="py-3 px-6">Absent</th>
                <th className="py-3 px-6">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {subjectAttendance?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No attendance records found for this student.
                  </td>
                </tr>
              ) : (
                subjectAttendance.map((sub) => {
                  const subPct = sub.attendancePercentage || 0;
                  const isSubLow = subPct < 75.0;
                  return (
                    <tr key={sub.subjectId} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-6 font-mono font-bold text-slate-800">{sub.subjectCode}</td>
                      <td className="py-3.5 px-6 font-medium text-slate-900">{sub.subjectName}</td>
                      <td className="py-3.5 px-6">{sub.totalClasses}</td>
                      <td className="py-3.5 px-6 text-emerald-600 font-semibold">{sub.presentCount}</td>
                      <td className="py-3.5 px-6 text-rose-600 font-semibold">{sub.absentCount}</td>
                      <td className="py-3.5 px-6">
                        <span className={`font-bold ${isSubLow ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {subPct}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Marks & Academic Grades Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-2">
          <Award className="w-5 h-5 text-amber-500" />
          <div>
            <h4 className="text-base font-bold text-slate-900">Academic Marks & Grades</h4>
            <p className="text-xs text-slate-500 mt-0.5">Evaluation across internal, assignment, and semester exams</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100">
                <th className="py-3 px-6">Subject</th>
                <th className="py-3 px-6">Internal (20)</th>
                <th className="py-3 px-6">Assignment (20)</th>
                <th className="py-3 px-6">Exam (60)</th>
                <th className="py-3 px-6">Total (100)</th>
                <th className="py-3 px-6">Percentage</th>
                <th className="py-3 px-6">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {marks?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No academic marks published for this student yet.
                  </td>
                </tr>
              ) : (
                marks.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-6 font-medium text-slate-900">
                      <div>
                        <p className="font-semibold text-slate-900">{m.subjectName}</p>
                        <span className="font-mono text-[10px] text-slate-400">{m.subjectCode}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">{m.internalMarks}</td>
                    <td className="py-3.5 px-6">{m.assignmentMarks}</td>
                    <td className="py-3.5 px-6">{m.examMarks}</td>
                    <td className="py-3.5 px-6 font-bold text-slate-900">{m.totalMarks}</td>
                    <td className="py-3.5 px-6 font-semibold">{m.percentage}%</td>
                    <td className="py-3.5 px-6">
                      <Badge variant={m.grade} size="sm">{m.grade}</Badge>
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

export default StudentDetail;
