import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/students/StudentList';
import StudentDetail from './pages/students/StudentDetail';
import StudentForm from './pages/students/StudentForm';
import DepartmentList from './pages/departments/DepartmentList';
import CourseList from './pages/courses/CourseList';
import SubjectList from './pages/subjects/SubjectList';
import AttendanceManagement from './pages/attendance/AttendanceManagement';
import MarksManagement from './pages/marks/MarksManagement';
import Reports from './pages/reports/Reports';
import UserList from './pages/users/UserList';
import Profile from './pages/Profile';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

// Student Portal Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfileView from './pages/student/StudentProfileView';
import StudentAttendanceView from './pages/student/StudentAttendanceView';
import StudentMarksView from './pages/student/StudentMarksView';
import StudentSubjectsView from './pages/student/StudentSubjectsView';

const RoleHome = () => {
  const { isStudent } = useAuth();
  return isStudent ? <Navigate to="/student/dashboard" replace /> : <Navigate to="/dashboard" replace />;
};

const DashboardRoute = () => {
  const { isStudent } = useAuth();
  return isStudent ? <Navigate to="/student/dashboard" replace /> : <Dashboard />;
};

export const App = () => {
  const staffRoles = ['ADMIN', 'STAFF', 'FACULTY'];
  const studentRoles = ['STUDENT', 'ADMIN'];

  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected dashboard routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<RoleHome />} />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute allowedRoles={staffRoles}>
                    <DashboardRoute />
                  </ProtectedRoute>
                }
              />

              {/* Student Management routes (Admin & Staff) */}
              <Route
                path="students"
                element={
                  <ProtectedRoute allowedRoles={staffRoles}>
                    <StudentList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="students/new"
                element={
                  <ProtectedRoute allowedRoles={staffRoles}>
                    <StudentForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="students/:id"
                element={
                  <ProtectedRoute allowedRoles={staffRoles}>
                    <StudentDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="students/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={staffRoles}>
                    <StudentForm />
                  </ProtectedRoute>
                }
              />

              {/* Academic entity routes (Admin & Staff) */}
              <Route
                path="departments"
                element={
                  <ProtectedRoute allowedRoles={staffRoles}>
                    <DepartmentList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="courses"
                element={
                  <ProtectedRoute allowedRoles={staffRoles}>
                    <CourseList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="subjects"
                element={
                  <ProtectedRoute allowedRoles={staffRoles}>
                    <SubjectList />
                  </ProtectedRoute>
                }
              />

              {/* Daily operations (Admin & Staff) */}
              <Route
                path="attendance"
                element={
                  <ProtectedRoute allowedRoles={staffRoles}>
                    <AttendanceManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="marks"
                element={
                  <ProtectedRoute allowedRoles={staffRoles}>
                    <MarksManagement />
                  </ProtectedRoute>
                }
              />

              {/* Reports (Admin & Staff) */}
              <Route
                path="reports"
                element={
                  <ProtectedRoute allowedRoles={staffRoles}>
                    <Reports />
                  </ProtectedRoute>
                }
              />

              {/* Administrative user management (Admin only) */}
              <Route
                path="users"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <UserList />
                  </ProtectedRoute>
                }
              />

              {/* Dedicated Student Portal Routes */}
              <Route
                path="student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={studentRoles}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="student/profile"
                element={
                  <ProtectedRoute allowedRoles={studentRoles}>
                    <StudentProfileView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="student/attendance"
                element={
                  <ProtectedRoute allowedRoles={studentRoles}>
                    <StudentAttendanceView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="student/marks"
                element={
                  <ProtectedRoute allowedRoles={studentRoles}>
                    <StudentMarksView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="student/subjects"
                element={
                  <ProtectedRoute allowedRoles={studentRoles}>
                    <StudentSubjectsView />
                  </ProtectedRoute>
                }
              />

              {/* Profile & Settings */}
              <Route path="profile" element={<Profile />} />
              <Route path="unauthorized" element={<Unauthorized />} />
            </Route>

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
