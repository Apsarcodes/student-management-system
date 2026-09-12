package com.sms.service;

import com.sms.dao.CourseDao;
import com.sms.dao.DepartmentDao;
import com.sms.exception.BadRequestException;
import com.sms.exception.DuplicateResourceException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.model.Course;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {
    private final CourseDao courseDao;
    private final DepartmentDao departmentDao;
    private final AuthService authService;

    public CourseService(CourseDao courseDao, DepartmentDao departmentDao, AuthService authService) {
        this.courseDao = courseDao;
        this.departmentDao = departmentDao;
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

    public List<Course> getAllCourses(Long departmentId) {
        Long enforcedDept = getEnforcedFacultyDepartmentId();
        if (enforcedDept != null) {
            departmentId = enforcedDept;
        }
        return courseDao.findAll(departmentId);
    }

    public Course getCourseById(Long id) {
        Course course = courseDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        Long enforcedDept = getEnforcedFacultyDepartmentId();
        if (enforcedDept != null && !enforcedDept.equals(course.getDepartmentId())) {
            throw new org.springframework.security.access.AccessDeniedException("You are not authorized to view courses outside your assigned department");
        }
        return course;
    }

    public Course createCourse(Course course) {
        if (!departmentDao.findById(course.getDepartmentId()).isPresent()) {
            throw new ResourceNotFoundException("Department not found with id: " + course.getDepartmentId());
        }
        if (courseDao.existsByCode(course.getCourseCode(), null)) {
            throw new DuplicateResourceException("Course code '" + course.getCourseCode() + "' already exists");
        }
        return courseDao.save(course);
    }

    public Course updateCourse(Long id, Course course) {
        Course existing = courseDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        if (!departmentDao.findById(course.getDepartmentId()).isPresent()) {
            throw new ResourceNotFoundException("Department not found with id: " + course.getDepartmentId());
        }
        if (courseDao.existsByCode(course.getCourseCode(), id)) {
            throw new DuplicateResourceException("Course code '" + course.getCourseCode() + "' is already in use");
        }

        existing.setCourseCode(course.getCourseCode());
        existing.setCourseName(course.getCourseName());
        existing.setDepartmentId(course.getDepartmentId());
        existing.setDurationYears(course.getDurationYears());
        existing.setDescription(course.getDescription());
        courseDao.update(existing);
        return existing;
    }

    public void deleteCourse(Long id) {
        Course course = courseDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        int students = courseDao.countStudents(id);
        if (students > 0) {
            throw new BadRequestException("Cannot delete course '" + course.getCourseName() +
                    "' because " + students + " student(s) are currently enrolled in it.");
        }

        courseDao.deleteById(id);
    }
}
