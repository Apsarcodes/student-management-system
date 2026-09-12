import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentPortalService } from '../../services/studentPortalService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Edit2,
  Lock,
  Save,
  Clock,
} from 'lucide-react';

export const StudentProfileView = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit contact modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({ phone: '', address: '' });
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    if (!user?.studentId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await studentPortalService.getProfile();
      if (res.success && res.data) {
        setStudent(res.data);
        setFormData({
          phone: res.data.phone || '',
          address: res.data.address || '',
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      error('Failed to load student profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.studentId]);

  if (!user?.studentId) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Academic Profile Pending Activation</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Your student account is pending administrator review and profile linking. Once approved, your complete academic records and identity details will appear here.
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

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await studentPortalService.updateProfile(formData);
      if (res.success && res.data) {
        setStudent(res.data);
        success('Contact details updated successfully!');
        setEditModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to update contact info:', err);
      error(err.response?.data?.message || 'Failed to update contact details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading student profile..." />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
        <p className="text-sm font-semibold text-rose-600">Student profile could not be found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-brand-500/20">
            {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-slate-900">
                {student.firstName} {student.lastName}
              </h2>
              <Badge variant={student.status}>{student.status}</Badge>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">Roll No: {student.studentId}</p>
            <p className="text-xs text-slate-500 mt-1">
              {student.courseName} • Semester {student.semester}
            </p>
          </div>
        </div>

        <button
          onClick={() => setEditModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          <span>Update Contact Details</span>
        </button>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Details Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-brand-600" />
              <span>Academic Enrollment</span>
            </h3>
            <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>Admin Verified</span>
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Department</span>
              <span className="font-semibold text-slate-800 text-right">{student.departmentName || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Degree Program</span>
              <span className="font-semibold text-slate-800 text-right">{student.courseName || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Current Semester</span>
              <span className="font-semibold text-slate-800">Semester {student.semester}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Academic Batch Year</span>
              <span className="font-semibold text-slate-800">{student.academicYear}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400 font-medium">Admission Date</span>
              <span className="font-semibold text-slate-800">{student.admissionDate || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Contact & Personal Details Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Personal & Contact Info</span>
            </h3>
            <button
              onClick={() => setEditModalOpen(true)}
              className="text-2xs font-semibold text-brand-600 hover:text-brand-700"
            >
              Edit
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Email Address</span>
              <span className="font-semibold text-slate-800">{student.email}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Phone Number</span>
              <span className="font-semibold text-slate-800">{student.phone || 'Not provided'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Gender</span>
              <span className="font-semibold text-slate-800">{student.gender || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Date of Birth</span>
              <span className="font-semibold text-slate-800">{student.dateOfBirth || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400 font-medium">Permanent Address</span>
              <span className="font-semibold text-slate-800 text-right max-w-xs truncate">
                {student.address || 'Not provided'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Note Alert */}
      <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200 text-xs text-slate-500 flex items-start space-x-3">
        <Lock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Security Notice:</strong> To ensure university record integrity, your name, enrollment ID, degree course, and email address are locked. If you need any corrections to institutional fields, please submit a formal request to the Registrar's Office.
        </p>
      </div>

      {/* Edit Contact Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Update Contact Details"
        subtitle="You can update your active contact phone number and home address"
      >
        <form onSubmit={handleUpdateContact} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Residential Address
            </label>
            <textarea
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter your street, city, state and zip code"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentProfileView;
