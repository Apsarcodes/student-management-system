import React, { useState, useEffect } from 'react';
import { departmentService } from '../../services/departmentService';
import { courseService } from '../../services/courseService';
import { subjectService } from '../../services/subjectService';
import { studentService } from '../../services/studentService';
import { attendanceService } from '../../services/attendanceService';
import { useToast } from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Save,
  Filter,
  Users,
  AlertTriangle,
  Calendar,
  Check,
  X,
} from 'lucide-react';

export const AttendanceManagement = () => {
  const { success, error } = useToast();

  // Selection states
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('3');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Student roster & Attendance items
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: { status: 'PRESENT'|'ABSENT', remarks: '' } }
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initial dependencies
  useEffect(() => {
    const init = async () => {
      try {
        const [deptRes, courseRes] = await Promise.all([
          departmentService.getAllDepartments(),
          courseService.getAllCourses(),
        ]);
        if (deptRes.success && deptRes.data.length > 0) {
          setDepartments(deptRes.data);
          setSelectedDept(deptRes.data[0].id.toString());
        }
        if (courseRes.success) {
          setCourses(courseRes.data);
          if (courseRes.data.length > 0) {
            setSelectedCourse(courseRes.data[0].id.toString());
          }
        }
      } catch (err) {
        console.error(err);
        error('Failed to load academic departments and courses.');
      }
    };
    init();
  }, [error]);

  // Load subjects when course & semester change
  useEffect(() => {
    if (!selectedCourse) return;
    const fetchSubjects = async () => {
      try {
        const res = await subjectService.getAllSubjects(
          Number(selectedCourse),
          Number(selectedSemester)
        );
        if (res.success && res.data) {
          setSubjects(res.data);
          if (res.data.length > 0) {
            setSelectedSubject(res.data[0].id.toString());
          } else {
            setSelectedSubject('');
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSubjects();
  }, [selectedCourse, selectedSemester]);

  // Load students and existing attendance when subject, date, or class changes
  const loadClassRoster = async () => {
    if (!selectedCourse || !selectedSemester || !selectedSubject) return;

    setLoadingStudents(true);
    try {
      // 1. Fetch active students in this course & semester
      const studentRes = await studentService.getStudentsByClass(
        Number(selectedCourse),
        Number(selectedSemester)
      );

      // 2. Fetch any already-recorded attendance for this subject & date
      const attendanceRes = await attendanceService.getAttendance(
        Number(selectedSubject),
        attendanceDate
      );

      const roster = studentRes.data || [];
      setStudents(roster);

      // 3. Map existing attendance or default to PRESENT
      const map = {};
      const existingRecords = attendanceRes.data || [];
      const recordByStudent = {};
      existingRecords.forEach((rec) => {
        recordByStudent[rec.studentId] = rec;
      });

      roster.forEach((s) => {
        if (recordByStudent[s.id]) {
          map[s.id] = {
            status: recordByStudent[s.id].status || 'PRESENT',
            remarks: recordByStudent[s.id].remarks || '',
          };
        } else {
          map[s.id] = {
            status: 'PRESENT',
            remarks: '',
          };
        }
      });

      setAttendanceMap(map);
    } catch (err) {
      console.error(err);
      error('Failed to load class roster.');
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (selectedCourse && selectedSemester && selectedSubject) {
      loadClassRoster();
    }
  }, [selectedCourse, selectedSemester, selectedSubject, attendanceDate]);

  const setAllStatus = (newStatus) => {
    const updated = { ...attendanceMap };
    students.forEach((s) => {
      updated[s.id] = {
        ...updated[s.id],
        status: newStatus,
      };
    });
    setAttendanceMap(updated);
  };

  const toggleStudentStatus = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedSubject || students.length === 0) return;

    setSaving(true);
    try {
      const items = students.map((s) => ({
        studentId: s.id,
        status: attendanceMap[s.id]?.status || 'PRESENT',
        remarks: attendanceMap[s.id]?.remarks || '',
      }));

      const payload = {
        subjectId: Number(selectedSubject),
        attendanceDate,
        items,
      };

      const res = await attendanceService.recordAttendance(payload);
      if (res.success) {
        success(`Attendance saved successfully for ${students.length} students on ${attendanceDate}.`);
      }
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendanceMap).filter(
    (item) => item.status === 'PRESENT'
  ).length;
  const absentCount = students.length - presentCount;
  const attendanceRate =
    students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Attendance Management
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Select class, course, and subject to record daily student attendance
        </p>
      </div>

      {/* Filter Selection Panel */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Filter className="w-4 h-4 text-brand-600" />
          <span>Class & Subject Selector</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Department */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                const matchingCourses = courses.filter(
                  (c) => c.departmentId.toString() === e.target.value
                );
                if (matchingCourses.length > 0) {
                  setSelectedCourse(matchingCourses[0].id.toString());
                }
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Course */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
              Course Program
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
            >
              {courses
                .filter((c) => !selectedDept || c.departmentId.toString() === selectedDept)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.courseName}
                  </option>
                ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
            >
              {subjects.length === 0 ? (
                <option value="">No subjects found</option>
              ) : (
                subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.subjectCode} - {sub.subjectName}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
              Date
            </label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Roster & Stats Header */}
      {students.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-6 text-xs font-semibold">
            <div className="flex items-center space-x-2 text-slate-700">
              <Users className="w-4 h-4 text-brand-600" />
              <span>Enrolled: {students.length}</span>
            </div>
            <div className="flex items-center space-x-2 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>Present: {presentCount}</span>
            </div>
            <div className="flex items-center space-x-2 text-rose-600">
              <XCircle className="w-4 h-4" />
              <span>Absent: {absentCount}</span>
            </div>
            <div className="text-slate-500 font-medium">
              Rate: <span className="font-bold text-slate-900">{attendanceRate}%</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAllStatus('PRESENT')}
              type="button"
              className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
            >
              Mark All Present
            </button>
            <button
              onClick={() => setAllStatus('ABSENT')}
              type="button"
              className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
            >
              Mark All Absent
            </button>
          </div>
        </div>
      )}

      {/* Student Attendance List */}
      {loadingStudents ? (
        <div className="py-20 bg-white rounded-3xl border border-slate-200">
          <LoadingSpinner size="lg" text="Loading student roster..." />
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Students Found"
          description="There are currently no active students enrolled in this course and semester."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <th className="py-3 px-6">Roll No</th>
                  <th className="py-3 px-6">Student Name</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {students.map((s) => {
                  const status = attendanceMap[s.id]?.status || 'PRESENT';
                  const remarks = attendanceMap[s.id]?.remarks || '';
                  const isPresent = status === 'PRESENT';

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-xs text-slate-800">
                        {s.studentId}
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-slate-900">
                        <div className="flex items-center space-x-3">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs">
                            {s.firstName?.charAt(0)}
                          </div>
                          <span>{s.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
                          <button
                            type="button"
                            onClick={() => toggleStudentStatus(s.id, 'PRESENT')}
                            className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              isPresent
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleStudentStatus(s.id, 'ABSENT')}
                            className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              !isPresent
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <input
                          type="text"
                          placeholder="Optional remarks (e.g. excused, late)..."
                          value={remarks}
                          onChange={(e) => handleRemarksChange(s.id, e.target.value)}
                          className="w-full max-w-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-brand-500 focus:bg-white"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Submit Attendance Button Footer */}
          <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Submitting records will update the official institutional attendance register.
            </p>
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Attendance</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
