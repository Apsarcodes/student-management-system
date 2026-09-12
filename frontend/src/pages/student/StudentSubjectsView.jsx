import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentPortalService } from '../../services/studentPortalService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  BookOpen,
  Library,
  GraduationCap,
  Award,
  Layers,
  Clock,
} from 'lucide-react';

export const StudentSubjectsView = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.studentId) {
      setLoading(false);
      return;
    }
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const res = await studentPortalService.getSubjects();
        if (res.success && res.data) {
          setSubjects(res.data);
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
        setError('Failed to load registered subjects.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [user?.studentId]);

  if (!user?.studentId) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Curriculum & Subjects Pending</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Your student account is pending administrator review and profile linking. Once approved, your assigned course syllabus and semester subjects will display here.
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
        <LoadingSpinner size="lg" text="Loading course curriculum..." />
      </div>
    );
  }

  const totalCredits = subjects.reduce((acc, curr) => acc + (curr.credits || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Curriculum & Enrolled Subjects</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Registered courses and credit hours for your current active semester
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-brand-50 border border-brand-200 text-brand-700 font-bold text-xs rounded-xl shadow-xs flex items-center space-x-2">
            <Award className="w-4 h-4" />
            <span>Total: {totalCredits} Credits</span>
          </div>
          <div className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl">
            {subjects.length} Subjects
          </div>
        </div>
      </div>

      {error ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <p className="text-sm font-semibold text-rose-600">{error}</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No subjects registered yet</h3>
          <p className="text-xs text-slate-400 mt-1">Please consult your academic advisor for semester subject registration.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 rounded-2xl bg-brand-50 text-brand-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                    {sub.credits || 3} Credits
                  </span>
                </div>

                <div className="mt-4">
                  <span className="font-mono text-2xs font-bold text-brand-600 uppercase tracking-wider">
                    {sub.subjectCode}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1 line-clamp-1">
                    {sub.subjectName}
                  </h3>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-500 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Department</span>
                    <span className="font-semibold text-slate-700">{sub.departmentName || 'General'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Program</span>
                    <span className="font-semibold text-slate-700">{sub.courseName || 'Core'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Semester</span>
                    <span className="font-semibold text-slate-700">Semester {sub.semester}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-400">
                <span>Mandatory Core Course</span>
                <span className="font-semibold text-emerald-600">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentSubjectsView;
