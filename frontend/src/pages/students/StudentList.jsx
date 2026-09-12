import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { departmentService } from '../../services/departmentService';
import { courseService } from '../../services/courseService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import {
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  GraduationCap,
  RefreshCw,
  X,
} from 'lucide-react';

export const StudentList = () => {
  const { user, isAdmin } = useAuth();
  const { success, error } = useToast();
  const isStaffWithDept = user?.role === 'STAFF' && !!user?.departmentId;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState(isStaffWithDept ? user.departmentId.toString() : '');
  const [courseId, setCourseId] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [semester, setSemester] = useState('');
  const [status, setStatus] = useState('All');

  // Sorting & Pagination
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState('DESC');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Delete dialog state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load dropdown options
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [deptRes, courseRes] = await Promise.all([
          departmentService.getAllDepartments(),
          courseService.getAllCourses(),
        ]);
        if (deptRes.success) setDepartments(deptRes.data);
        if (courseRes.success) setCourses(courseRes.data);
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    loadFilters();
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: search || undefined,
        departmentId: departmentId || undefined,
        courseId: courseId || undefined,
        academicYear: academicYear || undefined,
        semester: semester || undefined,
        status: status !== 'All' ? status : undefined,
        sortBy,
        sortDirection,
        page: currentPage,
        size: pageSize,
      };

      const res = await studentService.getStudents(params);
      if (res.success && res.data) {
        setStudents(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error(err);
      error('Failed to load students.');
    } finally {
      setLoading(false);
    }
  }, [search, departmentId, courseId, academicYear, semester, status, sortBy, sortDirection, currentPage, pageSize, error]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(columnKey);
      setSortDirection('ASC');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setDepartmentId('');
    setCourseId('');
    setAcademicYear('');
    setSemester('');
    setStatus('All');
    setCurrentPage(0);
  };

  const confirmDelete = (student) => {
    setStudentToDelete(student);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;
    try {
      setDeleting(true);
      const res = await studentService.deleteStudent(studentToDelete.id);
      if (res.success) {
        success('Student deleted successfully.');
        setDeleteModalOpen(false);
        setStudentToDelete(null);
        fetchStudents();
      }
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to delete student.');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Student ID',
      accessor: 'studentId',
      sortable: true,
      sortKey: 'student_id',
      render: (s) => (
        <span className="font-semibold text-slate-800 font-mono text-xs">{s.studentId}</span>
      ),
    },
    {
      header: 'Student Name',
      accessor: 'fullName',
      sortable: true,
      sortKey: 'name',
      render: (s) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
            {s.firstName?.charAt(0)}{s.lastName?.charAt(0)}
          </div>
          <div className="min-w-0">
            <Link
              to={`/students/${s.id}`}
              className="font-semibold text-slate-900 hover:text-brand-600 transition-colors block truncate"
            >
              {s.fullName}
            </Link>
            <span className="text-xs text-slate-400 block truncate">{s.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'departmentName',
      sortable: true,
      sortKey: 'department',
      render: (s) => (
        <div>
          <p className="font-medium text-slate-800 text-xs">{s.departmentName}</p>
          <span className="text-[10px] text-slate-400 font-mono">{s.departmentCode}</span>
        </div>
      ),
    },
    {
      header: 'Course & Class',
      accessor: 'courseName',
      render: (s) => (
        <div>
          <p className="font-medium text-slate-800 text-xs truncate max-w-[180px]">{s.courseName}</p>
          <p className="text-[11px] text-slate-500">Year {s.academicYear} • Sem {s.semester}</p>
        </div>
      ),
    },
    {
      header: 'Attendance',
      accessor: 'attendancePercentage',
      sortable: true,
      sortKey: 'attendance',
      render: (s) => {
        const pct = s.attendancePercentage;
        if (pct === null || pct === undefined) return <span className="text-xs text-slate-400">N/A</span>;
        const isLow = pct < 75.0;
        return (
          <div className="flex items-center space-x-2">
            <div className="w-12 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <span className={`text-xs font-bold ${isLow ? 'text-rose-600' : 'text-emerald-700'}`}>
              {pct}%
            </span>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (s) => <Badge variant={s.status}>{s.status}</Badge>,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (s) => (
        <div className="flex items-center space-x-1">
          <Link
            to={`/students/${s.id}`}
            title="View Profile"
            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link
            to={`/students/${s.id}/edit`}
            title="Edit Student"
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </Link>
          {isAdmin && (
            <button
              onClick={() => confirmDelete(s)}
              title="Delete Student"
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Student Directory</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {isStaffWithDept
              ? `Managing student records enrolled in ${user.departmentName || 'your department'}`
              : 'Manage student registrations, academic records, and profiles'}
          </p>
        </div>
        <Link
          to="/students/new"
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Student</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Department Filter */}
          <select
            value={isStaffWithDept ? user.departmentId.toString() : departmentId}
            disabled={isStaffWithDept}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setCourseId(''); // Reset course when dept changes
              setCurrentPage(0);
            }}
            className={`w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-colors ${
              isStaffWithDept
                ? 'bg-slate-100/80 cursor-not-allowed text-slate-500 font-medium'
                : 'bg-slate-50 focus:bg-white'
            }`}
          >
            {isStaffWithDept ? (
              <option value={user.departmentId}>
                {user.departmentName || 'Assigned Department'} {user.departmentCode ? `(${user.departmentCode})` : ''} [Locked]
              </option>
            ) : (
              <>
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </>
            )}
          </select>

          {/* Course Filter */}
          <select
            value={courseId}
            onChange={(e) => {
              setCourseId(e.target.value);
              setCurrentPage(0);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
          >
            <option value="">All Courses</option>
            {courses
              .filter((c) => !departmentId || c.departmentId.toString() === departmentId)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseName}
                </option>
              ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setCurrentPage(0);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Graduated">Graduated</option>
          </select>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span>Year:</span>
              <select
                value={academicYear}
                onChange={(e) => {
                  setAcademicYear(e.target.value);
                  setCurrentPage(0);
                }}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="">Any</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span>Semester:</span>
              <select
                value={semester}
                onChange={(e) => {
                  setSemester(e.target.value);
                  setCurrentPage(0);
                }}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="">Any</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Sem {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(search || departmentId || courseId || academicYear || semester || status !== 'All') && (
            <button
              onClick={handleResetFilters}
              className="flex items-center space-x-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Student Data Table */}
      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        emptyMessage="No students match your query. Try broadening your filters."
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => setCurrentPage(p)}
        totalElements={totalElements}
        pageSize={pageSize}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete Student"
        message={`Are you sure you want to permanently delete student ${studentToDelete?.fullName} (${studentToDelete?.studentId})? This will also remove their attendance and academic marks history.`}
        confirmText="Delete Student"
      />
    </div>
  );
};

export default StudentList;
