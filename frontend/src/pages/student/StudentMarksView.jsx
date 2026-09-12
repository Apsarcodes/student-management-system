import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentPortalService } from '../../services/studentPortalService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Award,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  FileText,
  Star,
  Clock,
} from 'lucide-react';

export const StudentMarksView = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.studentId) {
      setLoading(false);
      return;
    }
    const fetchMarks = async () => {
      try {
        setLoading(true);
        const res = await studentPortalService.getMarks();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load marks transcript:', err);
        setError('Failed to load academic marks.');
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, [user?.studentId]);

  if (!user?.studentId) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Academic Marks Pending Activation</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Your student account is pending administrator review and profile linking. Once approved, your examination scores, grades, and semester transcripts will display here.
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
        <LoadingSpinner size="lg" text="Generating academic transcript..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
        <p className="text-sm font-semibold text-rose-600">{error || 'Marks records unavailable.'}</p>
      </div>
    );
  }

  const { marks, stats } = data;

  const getGradeStyle = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'B':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'C':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'D':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Marks & Academic Transcript</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Official semester evaluations, internal assessments, and awarded letter grades
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cumulative Average</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats?.averagePercentage || 0}%
            </span>
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>Good Academic Standing</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">GPA Equivalent</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-indigo-600">
              {stats?.gpa ? stats.gpa.toFixed(1) : '0.0'}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 4.0 scale</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">4.0 Grade Point System</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Highest Subject</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-600">
              {stats?.highestScore ? `${stats.highestScore}%` : '-'}
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate mt-1">
            {stats?.highestSubject || 'N/A'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Graded Courses</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats?.totalEvaluated || 0}
            </span>
            <span className="text-xs text-slate-400 font-medium">Courses</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Evaluated this semester</p>
        </div>
      </div>

      {/* Transcript Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Official Subject Breakdown</h3>
            <p className="text-xs text-slate-400">Component scores: Internal (20) + Assignment (20) + Exam (60) = 100</p>
          </div>
          <FileText className="w-5 h-5 text-slate-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-2xs uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-6">Subject</th>
                <th className="py-3.5 px-6 text-center">Semester</th>
                <th className="py-3.5 px-6 text-center">Internal (20)</th>
                <th className="py-3.5 px-6 text-center">Assignment (20)</th>
                <th className="py-3.5 px-6 text-center">Final Exam (60)</th>
                <th className="py-3.5 px-6 text-center">Total (100)</th>
                <th className="py-3.5 px-6 text-center">Percentage</th>
                <th className="py-3.5 px-6 text-center">Grade</th>
                <th className="py-3.5 px-6 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {(marks || []).length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No academic marks published yet.
                  </td>
                </tr>
              ) : (
                marks.map((m) => {
                  const isPass = (m.percentage || 0) >= 40.0;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-900">{m.subjectName}</p>
                        <span className="font-mono text-2xs text-slate-400">{m.subjectCode}</span>
                      </td>
                      <td className="py-4 px-6 text-center font-medium text-slate-600">
                        Sem {m.semester}
                      </td>
                      <td className="py-4 px-6 text-center font-mono text-slate-600">
                        {m.internalMarks ?? '-'}
                      </td>
                      <td className="py-4 px-6 text-center font-mono text-slate-600">
                        {m.assignmentMarks ?? '-'}
                      </td>
                      <td className="py-4 px-6 text-center font-mono text-slate-600">
                        {m.examMarks ?? '-'}
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-slate-900 font-mono">
                        {m.totalMarks ?? '-'}
                      </td>
                      <td className="py-4 px-6 text-center font-semibold text-slate-800 font-mono">
                        {m.percentage ? `${m.percentage}%` : '-'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg font-black text-xs border ${getGradeStyle(
                            m.grade
                          )}`}
                        >
                          {m.grade || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span
                          className={`inline-flex items-center space-x-1 font-bold text-xs ${
                            isPass ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isPass ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Pass</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Fail</span>
                            </>
                          )}
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

      {/* Grading Scale Legend */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center space-x-2">
          <Star className="w-4 h-4 text-amber-500" />
          <span>University Grading Standard</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs text-center">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="font-black text-emerald-800 text-sm">A+</span>
            <p className="text-2xs text-emerald-600 mt-0.5">90% - 100%</p>
            <p className="text-2xs text-slate-500">Outstanding</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="font-black text-emerald-800 text-sm">A</span>
            <p className="text-2xs text-emerald-600 mt-0.5">80% - 89%</p>
            <p className="text-2xs text-slate-500">Excellent</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <span className="font-black text-blue-800 text-sm">B</span>
            <p className="text-2xs text-blue-600 mt-0.5">70% - 79%</p>
            <p className="text-2xs text-slate-500">Very Good</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <span className="font-black text-amber-800 text-sm">C</span>
            <p className="text-2xs text-amber-600 mt-0.5">60% - 69%</p>
            <p className="text-2xs text-slate-500">Good</p>
          </div>
          <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
            <span className="font-black text-orange-800 text-sm">D</span>
            <p className="text-2xs text-orange-600 mt-0.5">50% - 59%</p>
            <p className="text-2xs text-slate-500">Satisfactory</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
            <span className="font-black text-rose-800 text-sm">F</span>
            <p className="text-2xs text-rose-600 mt-0.5">&lt; 50%</p>
            <p className="text-2xs text-slate-500">Fail / Retake</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentMarksView;
