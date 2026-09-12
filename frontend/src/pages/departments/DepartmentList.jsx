import React, { useState, useEffect } from 'react';
import { departmentService } from '../../services/departmentService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Building2, Plus, Search, Edit2, Trash2, AlertCircle } from 'lucide-react';

export const DepartmentList = () => {
  const { isAdmin } = useAuth();
  const { success, error } = useToast();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add/Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ code: '', name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await departmentService.getAllDepartments();
      if (res.success && res.data) {
        setDepartments(res.data);
      }
    } catch (err) {
      console.error(err);
      error('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openAddModal = () => {
    setEditingDept(null);
    setFormData({ code: '', name: '', description: '' });
    setModalOpen(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setFormData({
      code: dept.code || '',
      name: dept.name || '',
      description: dept.description || '',
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      error('Code and Name are required fields.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingDept) {
        await departmentService.updateDepartment(editingDept.id, formData);
        success('Department updated successfully.');
      } else {
        await departmentService.createDepartment(formData);
        success('Department created successfully.');
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to save department.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (dept) => {
    setDeptToDelete(dept);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deptToDelete) return;
    setDeleting(true);
    try {
      await departmentService.deleteDepartment(deptToDelete.id);
      success('Department deleted successfully.');
      setDeleteModalOpen(false);
      setDeptToDelete(null);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || 'Cannot delete department.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredDepts = departments.filter((d) => {
    const term = search.toLowerCase();
    return (
      d.name?.toLowerCase().includes(term) ||
      d.code?.toLowerCase().includes(term) ||
      d.description?.toLowerCase().includes(term)
    );
  });

  const columns = [
    {
      header: 'Code',
      accessor: 'code',
      render: (d) => <span className="font-mono font-bold text-xs text-brand-600">{d.code}</span>,
    },
    {
      header: 'Department Name',
      accessor: 'name',
      render: (d) => <span className="font-semibold text-slate-900">{d.name}</span>,
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (d) => (
        <span className="text-xs text-slate-500 truncate max-w-sm block">
          {d.description || 'No description provided'}
        </span>
      ),
    },
    {
      header: 'Courses',
      accessor: 'courseCount',
      render: (d) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {d.courseCount || 0} courses
        </span>
      ),
    },
    {
      header: 'Students',
      accessor: 'studentCount',
      render: (d) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
          {d.studentCount || 0} students
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (d) => (
        <div className="flex items-center space-x-1">
          {isAdmin && (
            <>
              <button
                onClick={() => openEditModal(d)}
                title="Edit Department"
                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => confirmDelete(d)}
                title="Delete Department"
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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Departments</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage academic faculties, disciplines, and divisions
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search departments by code, name, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredDepts}
        loading={loading}
        emptyMessage="No departments found."
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Create Department'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Department Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. CSE"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Department Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Computer Science & Engineering"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Overview of the faculty and programs offered..."
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
              {submitting ? 'Saving...' : editingDept ? 'Update Department' : 'Save Department'}
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
        title="Delete Department"
        message={`Are you sure you want to delete ${deptToDelete?.name} (${deptToDelete?.code})? This will only succeed if there are 0 courses and 0 students assigned to it.`}
        confirmText="Delete Department"
      />
    </div>
  );
};

export default DepartmentList;
