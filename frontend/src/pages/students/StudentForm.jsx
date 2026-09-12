import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { departmentService } from '../../services/departmentService';
import { courseService } from '../../services/courseService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ArrowLeft, Save, User, GraduationCap, Calendar, Mail, Phone, MapPin } from 'lucide-react';

export const StudentForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();
  const isStaffWithDept = user?.role === 'STAFF' && !!user?.departmentId;

  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male',
    email: '',
    phone: '',
    address: '',
    departmentId: (!isEditMode && isStaffWithDept) ? user.departmentId.toString() : '',
    courseId: '',
    academicYear: 1,
    semester: 1,
    admissionDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    profileImageUrl: '',
  });

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadDependencies = async () => {
      try {
        const [deptRes, courseRes] = await Promise.all([
          departmentService.getAllDepartments(),
          courseService.getAllCourses(),
        ]);
        if (deptRes.success) setDepartments(deptRes.data);
        if (courseRes.success) setCourses(courseRes.data);

        if (isEditMode) {
          const studentRes = await studentService.getStudentById(id);
          if (studentRes.success && studentRes.data) {
            const s = studentRes.data;
            setFormData({
              studentId: s.studentId || '',
              firstName: s.firstName || '',
              lastName: s.lastName || '',
              dateOfBirth: s.dateOfBirth || '',
              gender: s.gender || 'Male',
              email: s.email || '',
              phone: s.phone || '',
              address: s.address || '',
              departmentId: s.departmentId?.toString() || '',
              courseId: s.courseId?.toString() || '',
              academicYear: s.academicYear || 1,
              semester: s.semester || 1,
              admissionDate: s.admissionDate || '',
              status: s.status || 'Active',
              profileImageUrl: s.profileImageUrl || '',
            });
          }
        } else if (isStaffWithDept) {
          setFormData((prev) => ({ ...prev, departmentId: user.departmentId.toString() }));
        }
      } catch (err) {
        console.error(err);
        error('Failed to load student details or metadata.');
      } finally {
        setFetching(false);
      }
    };

    loadDependencies();
  }, [id, isEditMode, error]);

  // Update courses when department changes
  useEffect(() => {
    if (formData.departmentId) {
      const matched = courses.filter((c) => c.departmentId.toString() === formData.departmentId);
      setFilteredCourses(matched);
      // Auto-select if there is exactly 1 course in this department and nothing selected yet
      if (matched.length === 1 && (!formData.courseId || !matched.some(c => c.id.toString() === formData.courseId))) {
        setFormData((prev) => ({ ...prev, courseId: matched[0].id.toString() }));
        setErrors((prev) => ({ ...prev, courseId: '' }));
      }
    } else {
      setFilteredCourses(courses);
    }
  }, [formData.departmentId, courses]);

  const validate = () => {
    const errs = {};
    if (!formData.studentId.trim()) errs.studentId = 'Student ID is required';
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    if (!formData.dateOfBirth) errs.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) errs.gender = 'Gender is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Invalid email address format';
    }
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    const activeDeptId = isStaffWithDept ? user.departmentId.toString() : formData.departmentId;
    if (!activeDeptId) errs.departmentId = 'Department selection is required';
    if (!formData.courseId) {
      if (activeDeptId && filteredCourses.length === 0) {
        errs.courseId = 'The selected department has no registered courses. Please add a course under Courses first.';
      } else {
        errs.courseId = 'Course selection is required';
      }
    }
    if (!formData.admissionDate) errs.admissionDate = 'Admission date is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const activeDeptId = isStaffWithDept ? user.departmentId : Number(formData.departmentId);
      const payload = {
        ...formData,
        departmentId: activeDeptId,
        courseId: Number(formData.courseId),
        academicYear: Number(formData.academicYear),
        semester: Number(formData.semester),
      };

      if (isEditMode) {
        await studentService.updateStudent(id, payload);
        success('Student profile updated successfully!');
      } else {
        await studentService.createStudent(payload);
        success('Student added successfully!');
      }
      navigate('/students');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Error saving student.';
      error(msg);
      if (err.response?.data?.data && typeof err.response.data.data === 'object') {
        setErrors(err.response.data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="py-20">
        <LoadingSpinner size="lg" text="Loading student information..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            to="/students"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white border border-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isEditMode ? 'Edit Student' : 'Add New Student'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {isEditMode ? 'Update academic and personal details' : 'Register a new student into the institution'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Details */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
              <p className="text-xs text-slate-500">Legal name, contact information, and identity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="e.g. John"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors ${
                  errors.firstName ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
                }`}
              />
              {errors.firstName && <p className="text-xs text-rose-600 mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g. Doe"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors ${
                  errors.lastName ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
                }`}
              />
              {errors.lastName && <p className="text-xs text-rose-600 mt-1">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Date of Birth *
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors ${
                  errors.dateOfBirth ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
                }`}
              />
              {errors.dateOfBirth && <p className="text-xs text-rose-600 mt-1">{errors.dateOfBirth}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@student.edu"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors ${
                  errors.email ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
                }`}
              />
              {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number *
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1-555-0199"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors ${
                  errors.phone ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
                }`}
              />
              {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Residential Address
              </label>
              <textarea
                name="address"
                rows="2"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street, City, State, ZIP..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Academic Details */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Academic Registration</h3>
              <p className="text-xs text-slate-500">Department, enrolled course, admission date, and year/semester</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Student ID / Roll No *
              </label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="STU-2026-001"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors ${
                  errors.studentId ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
                }`}
              />
              {errors.studentId && <p className="text-xs text-rose-600 mt-1">{errors.studentId}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Admission Date *
              </label>
              <input
                type="date"
                name="admissionDate"
                value={formData.admissionDate}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors ${
                  errors.admissionDate ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
                }`}
              />
              {errors.admissionDate && <p className="text-xs text-rose-600 mt-1">{errors.admissionDate}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Department * {isStaffWithDept && <span className="text-brand-600 font-normal lowercase">(assigned)</span>}
              </label>
              <select
                name="departmentId"
                value={isStaffWithDept ? user.departmentId.toString() : formData.departmentId}
                disabled={isStaffWithDept}
                onChange={(e) => {
                  handleChange(e);
                  setFormData((prev) => ({ ...prev, courseId: '' }));
                }}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-colors ${
                  isStaffWithDept
                    ? 'bg-slate-100/80 cursor-not-allowed text-slate-500 font-medium'
                    : 'bg-slate-50 focus:bg-white'
                } ${
                  errors.departmentId ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
                }`}
              >
                {isStaffWithDept ? (
                  <option value={user.departmentId}>
                    {user.departmentName || 'Assigned Department'} {user.departmentCode ? `(${user.departmentCode})` : ''} [Locked]
                  </option>
                ) : (
                  <>
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </>
                )}
              </select>
              {isStaffWithDept && (
                <p className="text-[11px] text-brand-600 font-medium mt-1">
                  Students are registered directly under your assigned department ({user.departmentCode}).
                </p>
              )}
              {errors.departmentId && <p className="text-xs text-rose-600 mt-1">{errors.departmentId}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Course Program *
              </label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                disabled={!formData.departmentId || filteredCourses.length === 0}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors ${
                  !formData.departmentId || filteredCourses.length === 0 ? 'opacity-70 cursor-not-allowed' : ''
                } ${
                  errors.courseId ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
                }`}
              >
                {!formData.departmentId ? (
                  <option value="">First select a department above</option>
                ) : filteredCourses.length === 0 ? (
                  <option value="">No courses available for this department</option>
                ) : (
                  <>
                    <option value="">
                      Select Course ({filteredCourses.length} {filteredCourses.length === 1 ? 'program' : 'programs'} available)
                    </option>
                    {filteredCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.courseName} ({c.courseCode})
                      </option>
                    ))}
                  </>
                )}
              </select>
              {errors.courseId && <p className="text-xs text-rose-600 mt-1">{errors.courseId}</p>}
              {formData.departmentId && filteredCourses.length === 0 && (
                <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start space-x-2">
                  <span className="font-bold">Notice:</span>
                  <span>
                    No courses have been added to this department yet.{' '}
                    <Link to="/courses" className="text-brand-600 font-semibold underline hover:text-brand-700">
                      Go to Courses to create one
                    </Link>{' '}
                    or choose a different department.
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Academic Year *
              </label>
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Semester *
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Enrollment Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Profile Avatar URL (Optional)
              </label>
              <input
                type="url"
                name="profileImageUrl"
                value={formData.profileImageUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <Link
            to="/students"
            className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isEditMode ? 'Update Student' : 'Save Student'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
