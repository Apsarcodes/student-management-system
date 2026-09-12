package com.sms.service;

import com.sms.dao.StudentDao;
import com.sms.dao.UserDao;
import com.sms.dto.PendingStudentResponse;
import com.sms.dto.StudentDto;
import com.sms.dto.UserDto;
import com.sms.exception.BadRequestException;
import com.sms.exception.DuplicateResourceException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.model.Student;
import com.sms.model.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {
    private final UserDao userDao;
    private final StudentDao studentDao;
    private final StudentService studentService;
    private final PasswordEncoder passwordEncoder;
    private final com.sms.dao.CourseDao courseDao;
    private final com.sms.dao.DepartmentDao departmentDao;

    public UserService(
            UserDao userDao,
            StudentDao studentDao,
            StudentService studentService,
            PasswordEncoder passwordEncoder,
            com.sms.dao.CourseDao courseDao,
            com.sms.dao.DepartmentDao departmentDao
    ) {
        this.userDao = userDao;
        this.studentDao = studentDao;
        this.studentService = studentService;
        this.passwordEncoder = passwordEncoder;
        this.courseDao = courseDao;
        this.departmentDao = departmentDao;
    }

    public List<User> getAllUsers() {
        List<User> users = userDao.findAll();
        users.forEach(u -> u.setPasswordHash(null)); // never return password hashes
        return users;
    }

    public User getUserById(Long id) {
        User user = userDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setPasswordHash(null);
        return user;
    }

    public User createUser(UserDto dto) {
        if (userDao.existsByUsername(dto.getUsername(), null)) {
            throw new DuplicateResourceException("Username '" + dto.getUsername() + "' is already taken");
        }
        if (userDao.existsByEmail(dto.getEmail(), null)) {
            throw new DuplicateResourceException("Email '" + dto.getEmail() + "' is already registered");
        }
        if (!StringUtils.hasText(dto.getPassword())) {
            throw new BadRequestException("Password is required for new users");
        }

        User user = new User();
        user.setUsername(dto.getUsername().toLowerCase().trim());
        user.setEmail(dto.getEmail().toLowerCase().trim());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setFullName(dto.getFullName().trim());
        user.setRole(dto.getRole() != null ? dto.getRole().toUpperCase() : "STAFF");
        user.setStatus(dto.getStatus() != null ? dto.getStatus().toUpperCase() : "ACTIVE");
        user.setStudentId(dto.getStudentId());
        user.setDepartmentId(dto.getDepartmentId());

        User saved = userDao.save(user);
        saved.setPasswordHash(null);
        return saved;
    }

    public User updateUser(Long id, UserDto dto) {
        User user = userDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (userDao.existsByUsername(dto.getUsername(), id)) {
            throw new DuplicateResourceException("Username '" + dto.getUsername() + "' is already taken");
        }
        if (userDao.existsByEmail(dto.getEmail(), id)) {
            throw new DuplicateResourceException("Email '" + dto.getEmail() + "' is already registered");
        }

        user.setUsername(dto.getUsername().toLowerCase().trim());
        user.setEmail(dto.getEmail().toLowerCase().trim());
        user.setFullName(dto.getFullName().trim());
        user.setRole(dto.getRole() != null ? dto.getRole().toUpperCase() : user.getRole());
        user.setStatus(dto.getStatus() != null ? dto.getStatus().toUpperCase() : user.getStatus());
        user.setStudentId(dto.getStudentId() != null ? dto.getStudentId() : user.getStudentId());
        user.setDepartmentId(dto.getDepartmentId() != null ? dto.getDepartmentId() : user.getDepartmentId());

        if (StringUtils.hasText(dto.getPassword())) {
            user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
            userDao.updatePassword(id, user.getPasswordHash());
        }

        userDao.update(user);
        user.setPasswordHash(null);
        return user;
    }

    public void deleteUser(Long id) {
        if (!userDao.findById(id).isPresent()) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userDao.deleteById(id);
    }

    public List<PendingStudentResponse> getPendingStudentRequests() {
        List<User> pendingUsers = userDao.findPendingStudentUsers();
        List<PendingStudentResponse> results = new ArrayList<>();
        List<Student> allUnlinked = studentDao.findUnlinkedStudents(null);

        for (User u : pendingUsers) {
            u.setPasswordHash(null);
            // Smart matching: find unlinked student with matching email or name
            Student match = null;
            for (Student s : allUnlinked) {
                if (s.getEmail() != null && s.getEmail().equalsIgnoreCase(u.getEmail())) {
                    match = s;
                    break;
                }
                String studentFullName = (s.getFirstName() + " " + s.getLastName()).trim().toLowerCase();
                if (studentFullName.equalsIgnoreCase(u.getFullName().trim().toLowerCase())) {
                    match = s;
                    break;
                }
            }
            results.add(new PendingStudentResponse(u, match));
        }
        return results;
    }

    public List<Student> getUnlinkedStudents(Long departmentId) {
        return studentDao.findUnlinkedStudents(departmentId);
    }

    @Transactional
    public User linkStudentToUser(Long userId, Long studentId) {
        User user = userDao.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Student student = studentDao.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student record not found with id: " + studentId));

        // Ensure student record is not already linked to another user
        List<User> existing = userDao.findAll();
        for (User u : existing) {
            if (studentId.equals(u.getStudentId()) && !userId.equals(u.getId())) {
                throw new DuplicateResourceException("Student " + student.getStudentId() + " is already linked to user @" + u.getUsername());
            }
        }

        userDao.linkStudentToUser(userId, studentId, student.getDepartmentId());
        User updated = userDao.findById(userId).orElse(user);
        updated.setPasswordHash(null);
        return updated;
    }

    @Transactional
    public User createAndLinkStudent(Long userId, StudentDto studentDto) {
        User user = userDao.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Create student record via StudentService
        Student createdStudent = studentService.createStudent(studentDto);

        // Link student to user
        userDao.linkStudentToUser(userId, createdStudent.getId(), createdStudent.getDepartmentId());
        User updated = userDao.findById(userId).orElse(user);
        updated.setPasswordHash(null);
        return updated;
    }

    @Transactional
    public User quickApproveStudent(Long userId) {
        User user = userDao.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.getStudentId() != null) {
            user.setPasswordHash(null);
            return user;
        }

        // Determine department: use user's department or default to first department
        Long departmentId = user.getDepartmentId();
        if (departmentId == null) {
            List<com.sms.model.Department> depts = departmentDao.findAll();
            if (!depts.isEmpty()) {
                departmentId = depts.get(0).getId();
            } else {
                throw new BadRequestException("No departments available to enroll student into.");
            }
        }

        // Determine course: find first course for this department
        List<com.sms.model.Course> courses = courseDao.findAll(departmentId);
        Long courseId;
        if (!courses.isEmpty()) {
            courseId = courses.get(0).getId();
        } else {
            List<com.sms.model.Course> allCourses = courseDao.findAll(null);
            if (!allCourses.isEmpty()) {
                courseId = allCourses.get(0).getId();
            } else {
                throw new BadRequestException("No courses available to enroll student into.");
            }
        }

        // Parse name into first and last name
        String fullName = user.getFullName() != null ? user.getFullName().trim() : "Student";
        String[] parts = fullName.split("\\s+");
        String firstName = parts.length > 0 && !parts[0].isEmpty() ? parts[0] : "Student";
        String lastName = parts.length > 1 ? String.join(" ", java.util.Arrays.copyOfRange(parts, 1, parts.length)) : "Enrolled";

        // Auto-generate unique student ID (roll number)
        int year = java.time.LocalDate.now().getYear();
        String generatedStudentId = "STU-" + year + "-" + (100 + (int)(Math.random() * 900));
        int attempts = 0;
        while (studentDao.existsByStudentId(generatedStudentId, null) && attempts < 20) {
            generatedStudentId = "STU-" + year + "-" + (100 + (int)(Math.random() * 900));
            attempts++;
        }

        StudentDto dto = new StudentDto();
        dto.setStudentId(generatedStudentId);
        dto.setFirstName(firstName);
        dto.setLastName(lastName);
        dto.setEmail(user.getEmail());
        dto.setPhone("9876543210");
        dto.setAddress("Campus Hostel");
        dto.setDepartmentId(departmentId);
        dto.setCourseId(courseId);
        dto.setAcademicYear(1);
        dto.setSemester(1);
        dto.setGender("Male");
        dto.setDateOfBirth(java.time.LocalDate.of(2004, 1, 1));
        dto.setAdmissionDate(java.time.LocalDate.now());
        dto.setStatus("Active");

        return createAndLinkStudent(userId, dto);
    }
}
