import React, { useState, useEffect } from 'react';
import { subjectService } from '../../services/subjectService';
import { courseService } from '../../services/courseService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Library, Plus, Search, Edit2, Trash2 } from 'lucide-react';

export const SubjectList = () => {
  const { isAdmin } = useAuth();
  const { success, error } = useToast();

  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  // Add/Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    subjectCode: '',
    subjectName: '',
    courseId: '',
    semester: 1,
    credits: 3,
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const [subRes, courseRes] = await Promise.all([
        subjectService.getAllSubjects(selectedCourseId || null, selectedSemester || null),
        courseService.getAllCourses(),
      ]);
      if (subRes.success) setSubjects(subRes.data);
      if (courseRes.success) setCourses(courseRes.data);
    } catch (err) {
      console.error(err);
      error('Failed to load subjects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [selectedCourseId, selectedSemester]);

  const openAddModal = () => {
    setEditingSubject(null);
    setFormData({
      subjectCode: '',
      subjectName: '',
      courseId: courses[0]?.id?.toString() || '',
      semester: 1,
      credits: 3,
    });
    setModalOpen(true);
  };

  const openEditModal = (sub) => {
    setEditingSubject(sub);
    setFormData({
      subjectCode: sub.subjectCode || '',
      subjectName: sub.subjectName || '',
      courseId: sub.courseId?.toString() || '',
      semester: sub.semester || 1,
      credits: sub.credits || 3,
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subjectCode.trim() || !formData.subjectName.trim() || !formData.courseId) {
      error('Subject Code, Subject Name, and Course are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        courseId: Number(formData.courseId),
        semester: Number(formData.semester),
        credits: Number(formData.credits),
      };

      if (editingSubject) {
        await subjectService.updateSubject(editingSubject.id, payload);
        success('Subject updated successfully.');
      } else {
        await subjectService.createSubject(payload);
        success('Subject created successfully.');
      }
      setModalOpen(false);
      fetchSubjects();
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to save subject.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (sub) => {
    setSubjectToDelete(sub);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!subjectToDelete) return;
    setDeleting(true);
    try {
      await subjectService.deleteSubject(subjectToDelete.id);
      success('Subject deleted successfully.');
      setDeleteModalOpen(false);
      setSubjectToDelete(null);
      fetchSubjects();
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || 'Cannot delete subject.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredSubjects = subjects.filter((s) => {
    const term = search.toLowerCase();
    return (
      s.subjectName?.toLowerCase().includes(term) ||
      s.subjectCode?.toLowerCase().includes(term) ||
      s.courseName?.toLowerCase().includes(term)
    );
  });

  const columns = [
    {
      header: 'Subject Code',
      accessor: 'subjectCode',
      render: (s) => <span className="font-mono font-bold text-xs text-brand-600">{s.subjectCode}</span>,
    },
    {
      header: 'Subject Name',
      accessor: 'subjectName',
      render: (s) => <span className="font-semibold text-slate-900">{s.subjectName}</span>,
    },
    {
      header: 'Course Program',
      accessor: 'courseName',
      render: (s) => (
        <div>
          <span className="text-xs font-medium text-slate-800 block truncate max-w-[200px]">
            {s.courseName}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">{s.courseCode}</span>
        </div>
      ),
    },
    {
      header: 'Semester',
      accessor: 'semester',
      render: (s) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          Semester {s.semester}
        </span>
      ),
    },
    {
      header: 'Credits',
      accessor: 'credits',
      render: (s) => (
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
          {s.credits} Credits
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (s) => (
        <div className="flex items-center space-x-1">
          {isAdmin && (
            <>
              <button
                onClick={() => openEditModal(s)}
                title="Edit Subject"
                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => confirmDelete(s)}
                title="Delete Subject"
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Subjects</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage curriculum courses, credit allocations, and course syllabi
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subjects by code or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
          />
        </div>

        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full sm:w-60 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.courseName}
            </option>
          ))}
        </select>

        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="w-full sm:w-36 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
            <option key={sem} value={sem}>
              Semester {sem}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredSubjects}
        loading={loading}
        emptyMessage="No subjects found."
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSubject ? 'Edit Subject' : 'Create Subject'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject Code *
            </label>
            <input
              type="text"
              required
              value={formData.subjectCode}
              onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
              placeholder="e.g. CS201"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject Name *
            </label>
            <input
              type="text"
              required
              value={formData.subjectName}
              onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
              placeholder="e.g. Database Management Systems"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Course Program *
              </label>
              <select
                required
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.courseName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Semester *
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Sem {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Credits *
            </label>
            <input
              type="number"
              min="1"
              max="10"
              required
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingSubject ? 'Update Subject' : 'Save Subject'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete Subject"
        message={`Are you sure you want to delete ${subjectToDelete?.subjectName} (${subjectToDelete?.subjectCode})? This will also remove attendance and marks records linked to this subject.`}
        confirmText="Delete Subject"
      />
    </div>
  );
};

export default SubjectList;
