import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { departmentService } from '../../services/departmentService';
import { courseService } from '../../services/courseService';
import { useToast } from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import {
  FileSpreadsheet,
  Download,
  Filter,
  Users,
  AlertTriangle,
  Award,
} from 'lucide-react';

export const Reports = () => {
  const { error } = useToast();

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const [activeTab, setActiveTab] = useState('directory'); // 'directory', 'lowAttendance', 'grades'
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const [deptRes, courseRes] = await Promise.all([
          departmentService.getAllDepartments(),
          courseService.getAllCourses(),
        ]);
        if (deptRes.success) setDepartments(deptRes.data);
        if (courseRes.success) setCourses(courseRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await reportService.getAcademicReport(
        selectedDept || null,
        selectedCourse || null
      );
      if (res.success && res.data) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error(err);
      error('Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedDept, selectedCourse]);

  // Export current active view to CSV
  const exportToCsv = () => {
    if (!reportData) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    let filename = 'report.csv';

    if (activeTab === 'directory') {
      filename = 'students_directory_report.csv';
      csvContent += 'Student ID,Full Name,Email,Phone,Department,Course,Year,Semester,Status\n';
      (reportData.students || []).forEach((s) => {
        csvContent += `"${s.studentId}","${s.fullName}","${s.email}","${s.phone}","${s.departmentName}","${s.courseName}",${s.academicYear},${s.semester},"${s.status}"\n`;
      });
    } else if (activeTab === 'lowAttendance') {
      filename = 'low_attendance_report.csv';
      csvContent += 'Student ID,Full Name,Email,Department,Course,Total Classes,Present,Attendance %\n';
      (reportData.lowAttendanceList || []).forEach((s) => {
        csvContent += `"${s.studentId}","${s.studentName}","${s.email}","${s.departmentName}","${s.courseName}",${s.totalClasses},${s.presentCount},"${s.attendancePercentage}%"\n`;
      });
    } else if (activeTab === 'grades') {
      filename = 'grade_distribution_report.csv';
      csvContent += 'Grade,Student Count\n';
      (reportData.gradeDistribution || []).forEach((g) => {
        csvContent += `"${g.grade}",${g.count}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Reports</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Institutional summaries, attendance compliance audits, and CSV exports
          </p>
        </div>

        <button
          onClick={exportToCsv}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Filter and Tab Selectors */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('directory')}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'directory'
                  ? 'bg-white text-brand-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student Directory
            </button>
            <button
              onClick={() => setActiveTab('lowAttendance')}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'lowAttendance'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Low Attendance (&lt;75%)
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'grades'
                  ? 'bg-white text-amber-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Grade Distribution
            </button>
          </div>

          {/* Department & Course Filters */}
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code}
                </option>
              ))}
            </select>

            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Report Content Table */}
      {loading ? (
        <div className="py-20 bg-white rounded-3xl border border-slate-200">
          <LoadingSpinner size="lg" text="Compiling academic report..." />
        </div>
      ) : activeTab === 'directory' ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Enrolled Students ({reportData?.students?.length || 0})
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase font-semibold border-b border-slate-100">
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Department</th>
                  <th className="py-3 px-6">Course</th>
                  <th className="py-3 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {(reportData?.students || []).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-6 font-mono font-bold text-xs">{s.studentId}</td>
                    <td className="py-3.5 px-6 font-semibold text-slate-900">{s.fullName}</td>
                    <td className="py-3.5 px-6 text-slate-500 text-xs">{s.email}</td>
                    <td className="py-3.5 px-6 text-xs">{s.departmentName}</td>
                    <td className="py-3.5 px-6 text-xs">{s.courseName}</td>
                    <td className="py-3.5 px-6">
                      <Badge variant={s.status} size="sm">{s.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'lowAttendance' ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center space-x-2 text-rose-700">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Students Requiring Attention (&lt;75% Attendance)
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase font-semibold border-b border-slate-100">
                  <th className="py-3 px-6">Student</th>
                  <th className="py-3 px-6">Department</th>
                  <th className="py-3 px-6">Course</th>
                  <th className="py-3 px-6 text-center">Total Sessions</th>
                  <th className="py-3 px-6 text-center">Attended</th>
                  <th className="py-3 px-6 text-right">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {(reportData?.lowAttendanceList || []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Great news! No students currently fall below the 75% attendance threshold.
                    </td>
                  </tr>
                ) : (
                  (reportData.lowAttendanceList || []).map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-6">
                        <p className="font-semibold text-slate-900">{s.studentName}</p>
                        <span className="font-mono text-xs text-slate-400">{s.studentId}</span>
                      </td>
                      <td className="py-3.5 px-6 text-xs">{s.departmentName}</td>
                      <td className="py-3.5 px-6 text-xs">{s.courseName}</td>
                      <td className="py-3.5 px-6 text-center">{s.totalClasses}</td>
                      <td className="py-3.5 px-6 text-center font-bold text-slate-900">{s.presentCount}</td>
                      <td className="py-3.5 px-6 text-right">
                        <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
                          {s.attendancePercentage}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center space-x-2 text-amber-600">
            <Award className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Grading Summary
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase font-semibold border-b border-slate-100">
                  <th className="py-3 px-6">Letter Grade</th>
                  <th className="py-3 px-6">Score Range</th>
                  <th className="py-3 px-6 text-right">Students Achieved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {(reportData?.gradeDistribution || []).map((g) => {
                  const ranges = {
                    'A+': '90 – 100%',
                    'A': '80 – 89%',
                    'B+': '70 – 79%',
                    'B': '60 – 69%',
                    'C': '50 – 59%',
                    'F': 'Below 50%',
                  };
                  return (
                    <tr key={g.grade} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-6">
                        <Badge variant={g.grade}>{g.grade}</Badge>
                      </td>
                      <td className="py-3.5 px-6 font-medium text-slate-600">
                        {ranges[g.grade] || ''}
                      </td>
                      <td className="py-3.5 px-6 text-right font-bold text-slate-900 text-base">
                        {g.count}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
