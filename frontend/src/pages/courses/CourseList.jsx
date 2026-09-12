import React, { useState, useEffect } from 'react';
import { courseService } from '../../services/courseService';
import { departmentService } from '../../services/departmentService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { BookOpen, Plus, Search, Edit2, Trash2 } from 'lucide-react';

export const CourseList = () => {
  const { isAdmin } = useAuth();
  const { success, error } = useToast();

  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');

  // Add/Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    departmentId: '',
    durationYears: 4,
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const [courseRes, deptRes] = await Promise.all([
        courseService.getAllCourses(selectedDeptId || null),
        departmentService.getAllDepartments(),
      ]);
      if (courseRes.success) setCourses(courseRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
    } catch (err) {
      console.error(err);
      error('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedDeptId]);

  const openAddModal = () => {
    setEditingCourse(null);
    setFormData({
      courseCode: '',
      courseName: '',
      departmentId: departments[0]?.id?.toString() || '',
      durationYears: 4,
      description: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      courseCode: course.courseCode || '',
      courseName: course.courseName || '',
      departmentId: course.departmentId?.toString() || '',
      durationYears: course.durationYears || 4,
      description: course.description || '',
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courseCode.trim() || !formData.courseName.trim() || !formData.departmentId) {
      error('Course Code, Name, and Department are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        departmentId: Number(formData.departmentId),
        durationYears: Number(formData.durationYears),
      };

      if (editingCourse) {
        await courseService.updateCourse(editingCourse.id, payload);
        success('Course updated successfully.');
      } else {
        await courseService.createCourse(payload);
        success('Course created successfully.');
      }
      setModalOpen(false);
      fetchCourses();
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to save course.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (course) => {
    setCourseToDelete(course);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;
    setDeleting(true);
    try {
      await courseService.deleteCourse(courseToDelete.id);
      success('Course deleted successfully.');
      setDeleteModalOpen(false);
      setCourseToDelete(null);
      fetchCourses();
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || 'Cannot delete course.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.courseName?.toLowerCase().includes(term) ||
      c.courseCode?.toLowerCase().includes(term) ||
      c.departmentName?.toLowerCase().includes(term)
    );
  });

  const columns = [
    {
      header: 'Code',
      accessor: 'courseCode',
      render: (c) => <span className="font-mono font-bold text-xs text-brand-600">{c.courseCode}</span>,
    },
    {
      header: 'Course Program',
      accessor: 'courseName',
      render: (c) => (
        <div>
          <span className="font-semibold text-slate-900 block">{c.courseName}</span>
          <span className="text-xs text-slate-400">{c.durationYears} Years Duration</span>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'departmentName',
      render: (c) => <span className="text-xs font-medium text-slate-700">{c.departmentName}</span>,
    },
    {
      header: 'Enrolled Students',
      accessor: 'studentCount',
      render: (c) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
          {c.studentCount || 0} enrolled
        </span>
      ),
    },
    {
      header: 'Subjects',
      accessor: 'subjectCount',
      render: (c) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {c.subjectCount || 0} subjects
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (c) => (
        <div className="flex items-center space-x-1">
          {isAdmin && (
            <>
              <button
                onClick={() => openEditModal(c)}
                title="Edit Course"
                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => confirmDelete(c)}
                title="Delete Course"
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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Degree & Course Programs</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Curriculum pathways, degree durations, and assigned departments
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses by code or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
          />
        </div>

        <select
          value={selectedDeptId}
          onChange={(e) => setSelectedDeptId(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredCourses}
        loading={loading}
        emptyMessage="No courses found."
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCourse ? 'Edit Course Program' : 'Create Course Program'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Course Code *
            </label>
            <input
              type="text"
              required
              value={formData.courseCode}
              onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
              placeholder="e.g. BTECH-CSE"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Course Name *
            </label>
            <input
              type="text"
              required
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              placeholder="e.g. Bachelor of Technology in Computer Science"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Department *
              </label>
              <select
                required
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Duration (Years) *
              </label>
              <select
                value={formData.durationYears}
                onChange={(e) => setFormData({ ...formData, durationYears: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                <option value={1}>1 Year</option>
                <option value={2}>2 Years</option>
                <option value={3}>3 Years</option>
                <option value={4}>4 Years</option>
                <option value={5}>5 Years</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Program curriculum overview..."
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
              {submitting ? 'Saving...' : editingCourse ? 'Update Course' : 'Save Course'}
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
        title="Delete Course Program"
        message={`Are you sure you want to delete ${courseToDelete?.courseName} (${courseToDelete?.courseCode})? This will only succeed if 0 students are enrolled.`}
        confirmText="Delete Course"
      />
    </div>
  );
};

export default CourseList;
