package com.sms.service;

import com.sms.dao.*;
import com.sms.dto.StudentDto;
import com.sms.exception.DuplicateResourceException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.model.Marks;
import com.sms.model.Student;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StudentService {
    private final StudentDao studentDao;
    private final DepartmentDao departmentDao;
    private final CourseDao courseDao;
    private final AttendanceDao attendanceDao;
    private final MarksDao marksDao;
    private final AuthService authService;

    public StudentService(
            StudentDao studentDao,
            DepartmentDao departmentDao,
            CourseDao courseDao,
            AttendanceDao attendanceDao,
            MarksDao marksDao,
            AuthService authService
    ) {
        this.studentDao = studentDao;
        this.departmentDao = departmentDao;
        this.courseDao = courseDao;
        this.attendanceDao = attendanceDao;
        this.marksDao = marksDao;
        this.authService = authService;
    }

    private Long getEnforcedFacultyDepartmentId() {
        try {
            com.sms.model.User currentUser = authService.getCurrentUser();
            if (currentUser != null && "STAFF".equalsIgnoreCase(currentUser.getRole()) && currentUser.getDepartmentId() != null) {
                return currentUser.getDepartmentId();
            }
        } catch (Exception ignored) {}
        return null;
    }

    public Map<String, Object> getStudents(
            String search,
            Long departmentId,
            Long courseId,
            Integer academicYear,
            Integer semester,
            String status,
            String sortBy,
            String sortDirection,
            int page,
            int size
    ) {
        Long enforcedDept = getEnforcedFacultyDepartmentId();
        if (enforcedDept != null) {
            departmentId = enforcedDept;
        }
        int offset = page * size;
        List<Student> students = studentDao.searchStudents(
                search, departmentId, courseId, academicYear, semester, status,
                sortBy, sortDirection, offset, size
        );
        long totalElements = studentDao.countStudents(
                search, departmentId, courseId, academicYear, semester, status
        );
        int totalPages = (int) Math.ceil((double) totalElements / size);

        Map<String, Object> response = new HashMap<>();
        response.put("content", students);
        response.put("currentPage", page);
        response.put("pageSize", size);
        response.put("totalElements", totalElements);
        response.put("totalPages", totalPages);
        response.put("isFirst", page == 0);
        response.put("isLast", page >= totalPages - 1 || totalPages == 0);

        return response;
    }

    public Map<String, Object> getStudentProfile(Long id) {
        Student student = studentDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        Long enforcedDept = getEnforcedFacultyDepartmentId();
        if (enforcedDept != null && !enforcedDept.equals(student.getDepartmentId())) {
            throw new org.springframework.security.access.AccessDeniedException("You are not authorized to access students outside your assigned department");
        }

        // Attendance summary
        Map<String, Object> attendanceSummary = attendanceDao.getStudentAttendanceSummary(id);
        List<Map<String, Object>> subjectAttendance = attendanceDao.getSubjectAttendanceForStudent(id);

        // Marks list
        List<Marks> marks = marksDao.findByStudentId(id);

        Map<String, Object> profile = new HashMap<>();
        profile.put("student", student);
        profile.put("attendanceSummary", attendanceSummary);
        profile.put("subjectAttendance", subjectAttendance);
        profile.put("marks", marks);

        return profile;
    }

    public Student getStudentById(Long id) {
        Student student = studentDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        Long enforcedDept = getEnforcedFacultyDepartmentId();
        if (enforcedDept != null && !enforcedDept.equals(student.getDepartmentId())) {
            throw new org.springframework.security.access.AccessDeniedException("You are not authorized to access students outside your assigned department");
        }

        return student;
    }

    public List<Student> getStudentsByClass(Long courseId, Integer semester) {
        Long enforcedDept = getEnforcedFacultyDepartmentId();
        if (enforcedDept != null) {
            courseDao.findById(courseId).ifPresent(c -> {
                if (!enforcedDept.equals(c.getDepartmentId())) {
                    throw new org.springframework.security.access.AccessDeniedException("You are not authorized to access courses outside your assigned department");
                }
            });
        }
        return studentDao.findByClass(courseId, semester);
    }

    public Student createStudent(StudentDto dto) {
        Long enforcedDept = getEnforcedFacultyDepartmentId();
        if (enforcedDept != null) {
            dto.setDepartmentId(enforcedDept);
        }

        if (studentDao.existsByStudentId(dto.getStudentId(), null)) {
            throw new DuplicateResourceException("Student ID '" + dto.getStudentId() + "' already exists");
        }
        if (studentDao.existsByEmail(dto.getEmail(), null)) {
            throw new DuplicateResourceException("Student with email '" + dto.getEmail() + "' already exists");
        }
        if (!departmentDao.findById(dto.getDepartmentId()).isPresent()) {
            throw new ResourceNotFoundException("Department not found with id: " + dto.getDepartmentId());
        }
        if (!courseDao.findById(dto.getCourseId()).isPresent()) {
            throw new ResourceNotFoundException("Course not found with id: " + dto.getCourseId());
        }

        Student s = new Student();
        s.setStudentId(dto.getStudentId().toUpperCase().trim());
        s.setFirstName(dto.getFirstName().trim());
        s.setLastName(dto.getLastName().trim());
        s.setDateOfBirth(dto.getDateOfBirth());
        s.setGender(dto.getGender());
        s.setEmail(dto.getEmail().toLowerCase().trim());
        s.setPhone(dto.getPhone().trim());
        s.setAddress(dto.getAddress());
        s.setDepartmentId(dto.getDepartmentId());
        s.setCourseId(dto.getCourseId());
        s.setAcademicYear(dto.getAcademicYear());
        s.setSemester(dto.getSemester());
        s.setAdmissionDate(dto.getAdmissionDate());
        s.setStatus(dto.getStatus() != null ? dto.getStatus() : "Active");
        s.setProfileImageUrl(dto.getProfileImageUrl());

        return studentDao.save(s);
    }

    public Student updateStudent(Long id, StudentDto dto) {
        Student existing = studentDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        Long enforcedDept = getEnforcedFacultyDepartmentId();
        if (enforcedDept != null) {
            if (!enforcedDept.equals(existing.getDepartmentId())) {
                throw new org.springframework.security.access.AccessDeniedException("You cannot modify students outside your assigned department");
            }
            dto.setDepartmentId(enforcedDept);
        }

        if (studentDao.existsByStudentId(dto.getStudentId(), id)) {
            throw new DuplicateResourceException("Student ID '" + dto.getStudentId() + "' is already assigned to another student");
        }
        if (studentDao.existsByEmail(dto.getEmail(), id)) {
            throw new DuplicateResourceException("Email '" + dto.getEmail() + "' is already assigned to another student");
        }
        if (!departmentDao.findById(dto.getDepartmentId()).isPresent()) {
            throw new ResourceNotFoundException("Department not found with id: " + dto.getDepartmentId());
        }
        if (!courseDao.findById(dto.getCourseId()).isPresent()) {
            throw new ResourceNotFoundException("Course not found with id: " + dto.getCourseId());
        }

        existing.setStudentId(dto.getStudentId().toUpperCase().trim());
        existing.setFirstName(dto.getFirstName().trim());
        existing.setLastName(dto.getLastName().trim());
        existing.setDateOfBirth(dto.getDateOfBirth());
        existing.setGender(dto.getGender());
        existing.setEmail(dto.getEmail().toLowerCase().trim());
        existing.setPhone(dto.getPhone().trim());
        existing.setAddress(dto.getAddress());
        existing.setDepartmentId(dto.getDepartmentId());
        existing.setCourseId(dto.getCourseId());
        existing.setAcademicYear(dto.getAcademicYear());
        existing.setSemester(dto.getSemester());
        existing.setAdmissionDate(dto.getAdmissionDate());
        existing.setStatus(dto.getStatus());
        existing.setProfileImageUrl(dto.getProfileImageUrl());

        studentDao.update(existing);
        return existing;
    }

    public void deleteStudent(Long id) {
        if (!studentDao.findById(id).isPresent()) {
            throw new ResourceNotFoundException("Student not found with id: " + id);
        }
        studentDao.deleteById(id);
    }
}
