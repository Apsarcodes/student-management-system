import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { userService } from '../../services/userService';
import { departmentService } from '../../services/departmentService';
import { courseService } from '../../services/courseService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Shield,
  UserCheck,
  Clock,
  Link as LinkIcon,
  UserPlus,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Zap,
  RefreshCw,
} from 'lucide-react';

export const UserList = () => {
  const { user: currentUser } = useAuth();
  const { success, error } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') === 'requests' ? 'requests' : 'users'
  );

  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Pending Student Requests
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Link Existing Student Modal
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [applicantToLink, setApplicantToLink] = useState(null);
  const [unlinkedStudents, setUnlinkedStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loadingUnlinked, setLoadingUnlinked] = useState(false);
  const [linkingSubmitting, setLinkingSubmitting] = useState(false);
  const [showAllDeptsInLink, setShowAllDeptsInLink] = useState(false);

  // Create & Link Student Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [applicantToCreate, setApplicantToCreate] = useState(null);
  const [studentFormData, setStudentFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '9876543210',
    address: 'Campus Hostel',
    departmentId: '',
    courseId: '',
    academicYear: 1,
    semester: 1,
    gender: 'Male',
    dateOfBirth: '2004-01-01',
    admissionDate: new Date().toISOString().split('T')[0],
    status: 'Active',
  });
  const [creatingStudentSubmitting, setCreatingStudentSubmitting] = useState(false);

  // Add/Edit User Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'STAFF',
    departmentId: '',
    status: 'ACTIVE',
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAllUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error(err);
      error('Failed to load system users.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.getAllDepartments();
      if (res.success && res.data) {
        setDepartments(res.data);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await courseService.getAllCourses();
      if (res.success && res.data) {
        setCourses(res.data);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    }
  };

  const fetchPending = async () => {
    try {
      setLoadingRequests(true);
      const res = await userService.getPendingStudents();
      if (res.success && res.data) {
        setPendingRequests(res.data);
      }
    } catch (err) {
      console.error('Failed to load pending student requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
    fetchCourses();
    fetchPending();

    // Silent background auto-polling every 8 seconds for real-time registration queue
    const interval = setInterval(async () => {
      try {
        const res = await userService.getPendingStudents();
        if (res.success && res.data) {
          setPendingRequests(res.data);
        }
      } catch {
        // silent
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'requests') setActiveTab('requests');
    else if (tab === 'users') setActiveTab('users');
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    if (tab === 'requests') {
      fetchPending();
    } else {
      fetchUsers();
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: 'STAFF',
      departmentId: '',
      status: 'ACTIVE',
    });
    setModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      username: u.username || '',
      email: u.email || '',
      password: '', // leave empty unless resetting
      fullName: u.fullName || '',
      role: u.role || 'STAFF',
      departmentId: u.departmentId ? u.departmentId.toString() : '',
      status: u.status || 'ACTIVE',
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.email.trim() || !formData.fullName.trim()) {
      error('Username, Email, and Full Name are required.');
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      error('Password is required for new accounts.');
      return;
    }

    if (formData.role === 'STAFF' && !formData.departmentId) {
      error('Please select an assigned department for faculty/staff.');
      return;
    }

    const payload = {
      ...formData,
      departmentId: formData.role === 'STAFF' && formData.departmentId ? Number(formData.departmentId) : null,
    };

    setSubmitting(true);
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, payload);
        success('User account updated successfully.');
      } else {
        await userService.createUser(payload);
        success('User created successfully.');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to save user.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (u) => {
    setUserToDelete(u);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await userService.deleteUser(userToDelete.id);
      success('User deleted successfully.');
      setDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  const loadUnlinkedForApplicant = async (deptId, showAll) => {
    try {
      setLoadingUnlinked(true);
      const res = await userService.getUnlinkedStudents(showAll ? null : deptId);
      if (res.success && res.data) {
        setUnlinkedStudents(res.data);
      }
    } catch (err) {
      console.error('Failed to load unlinked students:', err);
    } finally {
      setLoadingUnlinked(false);
    }
  };

  const openLinkModal = (item) => {
    setApplicantToLink(item);
    setSelectedStudentId(item.suggestedMatch ? item.suggestedMatch.id.toString() : '');
    setShowAllDeptsInLink(false);
    setLinkModalOpen(true);
    loadUnlinkedForApplicant(item.user.departmentId, false);
  };

  const handleToggleShowAllDepts = (e) => {
    const checked = e.target.checked;
    setShowAllDeptsInLink(checked);
    loadUnlinkedForApplicant(applicantToLink?.user?.departmentId, checked);
  };

  const handleConfirmLink = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      error('Please select an existing student record to link.');
      return;
    }
    setLinkingSubmitting(true);
    try {
      await userService.linkStudent(applicantToLink.user.id, selectedStudentId);
      success(`Account for ${applicantToLink.user.fullName} has been successfully activated and linked!`);
      setLinkModalOpen(false);
      fetchPending();
      fetchUsers();
      window.dispatchEvent(new Event('refreshPendingCount'));
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to link student account.');
    } finally {
      setLinkingSubmitting(false);
    }
  };

  const openApproveModal = (item) => {
    setApplicantToCreate(item);
    const parts = (item.user.fullName || '').trim().split(' ');
    const firstName = parts[0] || 'Student';
    const lastName = parts.slice(1).join(' ') || 'Candidate';
    const deptId = item.user.departmentId ? item.user.departmentId.toString() : (departments[0]?.id?.toString() || '');
    const deptCourses = courses.filter((c) => c.departmentId.toString() === deptId);
    const courseId = deptCourses[0]?.id?.toString() || (courses[0]?.id?.toString() || '');
    const randomId = 'STU-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);

    setStudentFormData({
      studentId: randomId,
      firstName,
      lastName,
      email: item.user.email,
      phone: '9876543210',
      address: 'Campus Hostel, Block A',
      departmentId: deptId,
      courseId: courseId,
      academicYear: 1,
      semester: 1,
      gender: 'Male',
      dateOfBirth: '2004-01-01',
      admissionDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    });
    setCreateModalOpen(true);
  };

  const handleQuickApprove = async (req) => {
    try {
      await userService.quickApproveStudent(req.user.id);
      success(`Registration approved! ${req.user.fullName} is now enrolled and activated.`);
      fetchPending();
      fetchUsers();
      window.dispatchEvent(new Event('refreshPendingCount'));
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to approve student registration.');
    }
  };

  const handleCreateAndLinkStudent = async (e) => {
    e.preventDefault();
    if (!studentFormData.studentId.trim() || !studentFormData.courseId) {
      error('Student ID and Course are required.');
      return;
    }
    setCreatingStudentSubmitting(true);
    try {
      const payload = {
        ...studentFormData,
        departmentId: Number(studentFormData.departmentId),
        courseId: Number(studentFormData.courseId),
        academicYear: Number(studentFormData.academicYear),
        semester: Number(studentFormData.semester),
      };
      await userService.approveAndCreateStudent(applicantToCreate.user.id, payload);
      success(`Student registration approved and account for ${applicantToCreate.user.fullName} activated!`);
      setCreateModalOpen(false);
      fetchPending();
      fetchUsers();
      window.dispatchEvent(new Event('refreshPendingCount'));
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || 'Failed to approve student.');
    } finally {
      setCreatingStudentSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.username?.toLowerCase().includes(term) ||
      u.fullName?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term)
    );
  });

  const columns = [
    {
      header: 'Full Name',
      accessor: 'fullName',
      render: (u) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
            {u.fullName?.charAt(0)}
          </div>
          <div>
            <span className="font-semibold text-slate-900 block">{u.fullName}</span>
            <span className="text-xs text-slate-400 font-mono">@{u.username}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (u) => <span className="text-xs text-slate-600">{u.email}</span>,
    },
    {
      header: 'System Role',
      accessor: 'role',
      render: (u) => (
        <div className="flex items-center space-x-1.5">
          {u.role === 'ADMIN' ? (
            <Badge variant="admin">ADMIN</Badge>
          ) : (
            <Badge variant="staff">STAFF</Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Department Scope',
      accessor: 'departmentCode',
      render: (u) => {
        if (u.role === 'ADMIN') {
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              All Departments
            </span>
          );
        }
        if (u.departmentCode) {
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {u.departmentCode} - {u.departmentName || ''}
            </span>
          );
        }
        return <span className="text-xs text-slate-400 italic">None</span>;
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (u) => <Badge variant={u.status}>{u.status}</Badge>,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (u) => (
        <div className="flex items-center space-x-1">
          <button
            onClick={() => openEditModal(u)}
            title="Edit User"
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {u.id !== currentUser?.id && (
            <button
              onClick={() => confirmDelete(u)}
              title="Delete User"
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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">User Administration</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage administrative access, faculty logins, and student account linking requests
          </p>
        </div>

        {activeTab === 'users' && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-4 border-b border-slate-200">
        <button
          type="button"
          onClick={() => handleTabChange('users')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'users'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>System Accounts</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
            {users.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('requests')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'requests'
              ? 'border-amber-500 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Student Registration Requests</span>
          {pendingRequests.length > 0 ? (
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-amber-500 text-white font-bold animate-pulse">
              {pendingRequests.length}
            </span>
          ) : (
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
              0
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: System Accounts */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users by name, username, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredUsers}
            loading={loading}
            emptyMessage="No users found."
          />
        </div>
      )}

      {/* Tab 2: Pending Student Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-700">Live Registration Stream Active</span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">• Syncs automatically every 8s</span>
            </div>
            <button
              onClick={() => {
                fetchPending();
                window.dispatchEvent(new Event('refreshPendingCount'));
              }}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100/80 px-2.5 py-1 rounded-lg transition-colors self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Stream Now</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Student Registration Requests:</span> When a student creates an account online, their registration appears here for administrative approval. Click <strong className="text-emerald-800">"Approve"</strong> or <strong className="text-indigo-800">"Quick Approve"</strong> to enroll the student and automatically activate their portal access.
            </div>
          </div>

          {loadingRequests ? (
            <div className="py-16 text-center text-slate-500 text-sm">Loading pending student requests...</div>
          ) : pendingRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">All Student Requests Processed</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                There are no student accounts pending review. New online student sign-ups will automatically appear here for approval.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Student Applicant</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Status / Match</th>
                      <th className="px-6 py-4 text-right">Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingRequests.map((req) => (
                      <tr key={req.user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                              {req.user.fullName?.charAt(0)}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 block">{req.user.fullName}</span>
                              <span className="text-xs text-slate-400 font-mono">@{req.user.username}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 font-mono">
                          {req.user.email}
                        </td>
                        <td className="px-6 py-4">
                          {req.user.departmentCode ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {req.user.departmentCode}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Default</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {req.suggestedMatch ? (
                            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              <span className="font-semibold">
                                Matches: {req.suggestedMatch.firstName} ({req.suggestedMatch.studentId})
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3" />
                              <span>Pending Approval</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => openApproveModal(req)}
                              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                              title="Review details and approve admission"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleQuickApprove(req)}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors cursor-pointer"
                              title="Instant 1-Click Approve (auto-generates Roll No & enrolls)"
                            >
                              <Zap className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Quick Approve</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => openLinkModal(req)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 text-xs font-medium transition-colors cursor-pointer"
                              title="Link to already enrolled student profile instead (if previously added)"
                            >
                              <LinkIcon className="w-3 h-3 text-slate-400" />
                              <span>Link Existing</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => confirmDelete(req.user)}
                              title="Reject Registration"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? 'Edit User Profile' : 'Create User Account'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Dr. Jane Doe"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Username *
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="e.g. jdoe"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jdoe@university.edu"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password {editingUser ? '(Leave empty to keep unchanged)' : '*'}
            </label>
            <input
              type="password"
              required={!editingUser}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingUser ? '••••••••' : 'Minimum 6 characters'}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                <option value="STAFF">Faculty / Staff</option>
                <option value="ADMIN">System Administrator</option>
                <option value="STUDENT">Student</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {formData.role === 'STAFF' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Assigned Department *
              </label>
              <select
                required
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                <option value="">Select Faculty Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Faculty will be strictly restricted to accessing students, courses, attendance, and marks within this department.
              </p>
            </div>
          )}

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
              {submitting ? 'Saving...' : editingUser ? 'Update Account' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Link Existing Student */}
      <Modal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        title="Link to Pre-Enrolled Student Profile"
      >
        <form onSubmit={handleConfirmLink} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            Use this option <strong>only if this student was already enrolled previously</strong> in the database. For new student registrations, close this and use the green <strong>"Approve"</strong> button instead.
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Applicant:</span>
              <span className="font-bold text-slate-900">{applicantToLink?.user?.fullName} (@{applicantToLink?.user?.username})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email:</span>
              <span className="font-mono text-slate-800">{applicantToLink?.user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Department:</span>
              <span className="font-semibold text-brand-700">{applicantToLink?.user?.departmentName || 'All Departments'}</span>
            </div>
          </div>

          {applicantToLink?.suggestedMatch && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="text-xs text-emerald-900">
                <div className="font-bold flex items-center space-x-1.5 text-emerald-800">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Recommended Student Record Match</span>
                </div>
                <div className="mt-1">
                  {applicantToLink.suggestedMatch.firstName} {applicantToLink.suggestedMatch.lastName} ({applicantToLink.suggestedMatch.studentId}) — {applicantToLink.suggestedMatch.courseName}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentId(applicantToLink.suggestedMatch.id.toString())}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors ml-2 cursor-pointer"
              >
                Use Match
              </button>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Select Pre-Enrolled Student Profile *
              </label>
              <label className="flex items-center space-x-1.5 text-xs text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAllDeptsInLink}
                  onChange={handleToggleShowAllDepts}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span>Include All Departments</span>
              </label>
            </div>

            {loadingUnlinked ? (
              <div className="py-4 text-center text-xs text-slate-500">Loading student records...</div>
            ) : unlinkedStudents.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 text-xs text-amber-800 border border-amber-200">
                No unlinked student profiles found in this department. If this is a new student, close this dialog and click the green <strong>"Approve"</strong> button to enroll them directly.
              </div>
            ) : (
              <select
                required
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                <option value="">-- Choose student record --</option>
                {unlinkedStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.studentId} • {s.firstName} {s.lastName} ({s.departmentCode} • {s.courseName || s.courseCode || 'Course'})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setLinkModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={linkingSubmitting || !selectedStudentId}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {linkingSubmitting ? 'Linking...' : 'Confirm & Link Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Approve Student Registration */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Approve Student Registration"
      >
        <form onSubmit={handleCreateAndLinkStudent} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Admission & Enrollment:</span> Review admission details below. The official Student ID (Roll Number) has been auto-generated. Click <strong>"Confirm & Approve Student"</strong> to enroll them and immediately activate their portal access.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                First Name *
              </label>
              <input
                type="text"
                required
                value={studentFormData.firstName}
                onChange={(e) => setStudentFormData({ ...studentFormData, firstName: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={studentFormData.lastName}
                onChange={(e) => setStudentFormData({ ...studentFormData, lastName: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Student ID / Roll No *
              </label>
              <input
                type="text"
                required
                value={studentFormData.studentId}
                onChange={(e) => setStudentFormData({ ...studentFormData, studentId: e.target.value })}
                placeholder="e.g. STU-2024-505"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Gender *
              </label>
              <select
                value={studentFormData.gender}
                onChange={(e) => setStudentFormData({ ...studentFormData, gender: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Department *
              </label>
              <select
                required
                value={studentFormData.departmentId}
                onChange={(e) => {
                  const dId = e.target.value;
                  const deptCourses = courses.filter((c) => c.departmentId.toString() === dId);
                  setStudentFormData({
                    ...studentFormData,
                    departmentId: dId,
                    courseId: deptCourses[0]?.id?.toString() || '',
                  });
                }}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Enrolled Course *
              </label>
              <select
                required
                value={studentFormData.courseId}
                onChange={(e) => setStudentFormData({ ...studentFormData, courseId: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                <option value="">Select Course</option>
                {courses
                  .filter((c) => !studentFormData.departmentId || c.departmentId.toString() === studentFormData.departmentId.toString())
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.courseName} ({c.courseCode})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Academic Year *
              </label>
              <select
                value={studentFormData.academicYear}
                onChange={(e) => setStudentFormData({ ...studentFormData, academicYear: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                {[1, 2, 3, 4, 5].map((y) => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Semester *
              </label>
              <select
                value={studentFormData.semester}
                onChange={(e) => setStudentFormData({ ...studentFormData, semester: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={studentFormData.dateOfBirth}
                onChange={(e) => setStudentFormData({ ...studentFormData, dateOfBirth: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={studentFormData.phone}
                onChange={(e) => setStudentFormData({ ...studentFormData, phone: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Admission Date *
              </label>
              <input
                type="date"
                required
                value={studentFormData.admissionDate}
                onChange={(e) => setStudentFormData({ ...studentFormData, admissionDate: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setCreateModalOpen(false);
                openLinkModal(applicantToCreate);
              }}
              className="text-xs text-slate-500 hover:text-indigo-600 underline cursor-pointer"
            >
              Link to existing record instead
            </button>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingStudentSubmitting}
                className="inline-flex items-center space-x-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{creatingStudentSubmitting ? 'Approving & Enrolling...' : 'Confirm & Approve Student'}</span>
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete User Account"
        message={`Are you sure you want to delete user account ${userToDelete?.fullName} (@${userToDelete?.username})?`}
        confirmText="Delete Account"
      />
    </div>
  );
};

export default UserList;
