import React, { useState, useEffect } from 'react';
import { courseService } from '../../services/courseService';
import { subjectService } from '../../services/subjectService';
import { studentService } from '../../services/studentService';
import { marksService } from '../../services/marksService';
import { useToast } from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { Award, Save, Filter, Users, CheckCircle2 } from 'lucide-react';

export const MarksManagement = () => {
  const { success, error } = useToast();

  // Selections
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('3');
  const [selectedSubject, setSelectedSubject] = useState('');

  // Roster and marks data
  const [students, setStudents] = useState([]);
  const [marksMap, setMarksMap] = useState({}); // { studentId: { internal: 0, assignment: 0, exam: 0, total: 0, pct: 0, grade: 'F' } }
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  // Helper function to calculate total, pct, and grade locally for live feedback
  const computeGrade = (internal, assignment, exam) => {
    const intVal = parseFloat(internal) || 0;
    const assignVal = parseFloat(assignment) || 0;
    const examVal = parseFloat(exam) || 0;

    const total = Math.round((intVal + assignVal + examVal) * 100) / 100;
    const percentage = total; // out of 100

    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';

    return { total, percentage, grade };
  };

  useEffect(() => {
    const init = async () => {
      try {
        const courseRes = await courseService.getAllCourses();
        if (courseRes.success && courseRes.data.length > 0) {
          setCourses(courseRes.data);
          setSelectedCourse(courseRes.data[0].id.toString());
        }
      } catch (err) {
        console.error(err);
        error('Failed to load courses.');
      }
    };
    init();
  }, [error]);

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

  // Load students and existing marks
  const loadClassMarks = async () => {
    if (!selectedCourse || !selectedSemester || !selectedSubject) return;

    setLoadingStudents(true);
    try {
      const [studentRes, marksRes] = await Promise.all([
        studentService.getStudentsByClass(Number(selectedCourse), Number(selectedSemester)),
        marksService.getMarks(Number(selectedSubject)),
      ]);

      const roster = studentRes.data || [];
      setStudents(roster);

      const existingMarks = marksRes.data || [];
      const markByStudent = {};
      existingMarks.forEach((m) => {
        markByStudent[m.studentId] = m;
      });

      const map = {};
      roster.forEach((s) => {
        const existing = markByStudent[s.id];
        if (existing) {
          map[s.id] = {
            internal: existing.internalMarks || 0,
            assignment: existing.assignmentMarks || 0,
            exam: existing.examMarks || 0,
            total: existing.totalMarks || 0,
            pct: existing.percentage || 0,
            grade: existing.grade || 'F',
          };
        } else {
          map[s.id] = {
            internal: 0,
            assignment: 0,
            exam: 0,
            total: 0,
            pct: 0,
            grade: 'F',
          };
        }
      });

      setMarksMap(map);
    } catch (err) {
      console.error(err);
      error('Failed to load marks roster.');
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (selectedCourse && selectedSemester && selectedSubject) {
      loadClassMarks();
    }
  }, [selectedCourse, selectedSemester, selectedSubject]);

  const handleMarkChange = (studentId, field, value) => {
    const current = marksMap[studentId] || { internal: 0, assignment: 0, exam: 0 };
    const num = Math.max(0, parseFloat(value) || 0);

    let updatedInternal = field === 'internal' ? num : current.internal;
    let updatedAssignment = field === 'assignment' ? num : current.assignment;
    let updatedExam = field === 'exam' ? num : current.exam;

    // Enforce maximums
    if (updatedInternal > 20) updatedInternal = 20;
    if (updatedAssignment > 20) updatedAssignment = 20;
    if (updatedExam > 60) updatedExam = 60;

    const { total, percentage, grade } = computeGrade(
      updatedInternal,
      updatedAssignment,
      updatedExam
    );

    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        internal: updatedInternal,
        assignment: updatedAssignment,
        exam: updatedExam,
        total,
        pct: percentage,
        grade,
      },
    }));
  };

  const handleSaveMarks = async () => {
    if (!selectedSubject || students.length === 0) return;

    setSaving(true);
    try {
      const items = students.map((s) => ({
        studentId: s.id,
        internalMarks: marksMap[s.id]?.internal || 0,
        assignmentMarks: marksMap[s.id]?.assignment || 0,
        examMarks: marksMap[s.id]?.exam || 0,
      }));

      const payload = {
        subjectId: Number(selectedSubject),
        items,
      };

      const res = await marksService.recordMarks(payload);
      if (res.success) {
        success('Marks and letter grades recorded successfully.');
      }
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to save marks.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Marks & Grades Entry
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Record internal assessments, assignments, and exam results with live grade computation
        </p>
      </div>

      {/* Filter Panel */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Filter className="w-4 h-4 text-brand-600" />
          <span>Select Course & Subject</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
              Course Program
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseName}
                </option>
              ))}
            </select>
          </div>

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
        </div>
      </div>

      {/* Roster & Grade Matrix */}
      {loadingStudents ? (
        <div className="py-20 bg-white rounded-3xl border border-slate-200">
          <LoadingSpinner size="lg" text="Loading marks spreadsheet..." />
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Students Found"
          description="There are currently no active students in this semester."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <th className="py-3 px-6">Roll No</th>
                  <th className="py-3 px-6">Student</th>
                  <th className="py-3 px-4">Internal (Max 20)</th>
                  <th className="py-3 px-4">Assignment (Max 20)</th>
                  <th className="py-3 px-4">Exam (Max 60)</th>
                  <th className="py-3 px-4 text-center">Total (100)</th>
                  <th className="py-3 px-4 text-center">Percentage</th>
                  <th className="py-3 px-6 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {students.map((s) => {
                  const m = marksMap[s.id] || {
                    internal: 0,
                    assignment: 0,
                    exam: 0,
                    total: 0,
                    pct: 0,
                    grade: 'F',
                  };

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-xs text-slate-800">
                        {s.studentId}
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-slate-900">
                        {s.fullName}
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="20"
                          value={m.internal}
                          onChange={(e) => handleMarkChange(s.id, 'internal', e.target.value)}
                          className="w-20 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="20"
                          value={m.assignment}
                          onChange={(e) => handleMarkChange(s.id, 'assignment', e.target.value)}
                          className="w-20 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="60"
                          value={m.exam}
                          onChange={(e) => handleMarkChange(s.id, 'exam', e.target.value)}
                          className="w-20 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                        {m.total}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-600">
                        {m.pct}%
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <Badge variant={m.grade} size="sm">{m.grade}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Save Button */}
          <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Grade criteria: A+ (90-100), A (80-89), B+ (70-79), B (60-69), C (50-59), F (Below 50)
            </p>
            <button
              onClick={handleSaveMarks}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Marks</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarksManagement;
