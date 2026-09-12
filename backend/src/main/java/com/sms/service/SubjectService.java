package com.sms.service;

import com.sms.dao.CourseDao;
import com.sms.dao.SubjectDao;
import com.sms.exception.DuplicateResourceException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.model.Course;
import com.sms.model.Subject;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubjectService {
    private final SubjectDao subjectDao;
    private final CourseDao courseDao;
    private final AuthService authService;

    public SubjectService(SubjectDao subjectDao, CourseDao courseDao, AuthService authService) {
        this.subjectDao = subjectDao;
        this.courseDao = courseDao;
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

    public List<Subject> getAllSubjects(Long courseId, Integer semester) {
        Long enforcedDept = getEnforcedFacultyDepartmentId();
        return subjectDao.findAll(courseId, semester, enforcedDept);
    }

    public Subject getSubjectById(Long id) {
        Subject subject = subjectDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));

        Long enforcedDept = getEnforcedFacultyDepartmentId();
        if (enforcedDept != null && !enforcedDept.equals(subject.getDepartmentId())) {
            throw new AccessDeniedException("You are not authorized to view subjects outside your assigned department");
        }

        return subject;
    }

    public Subject createSubject(Subject subject) {
        Course course = courseDao.findById(subject.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + subject.getCourseId()));

        Long enforcedDept = getEnforcedFacultyDepartmentId();
        if (enforcedDept != null && !enforcedDept.equals(course.getDepartmentId())) {
            throw new AccessDeniedException("You are not authorized to create subjects for courses outside your assigned department");
        }

        if (subjectDao.existsByCode(subject.getSubjectCode(), null)) {
            throw new DuplicateResourceException("Subject code '" + subject.getSubjectCode() + "' already exists");
        }
        return subjectDao.save(subject);
    }

    public Subject updateSubject(Long id, Subject subject) {
        Subject existing = subjectDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));

        Long enforcedDept = getEnforcedFacultyDepartmentId();
        if (enforcedDept != null && !enforcedDept.equals(existing.getDepartmentId())) {
            throw new AccessDeniedException("You are not authorized to update subjects outside your assigned department");
        }

        Course targetCourse = courseDao.findById(subject.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + subject.getCourseId()));

        if (enforcedDept != null && !enforcedDept.equals(targetCourse.getDepartmentId())) {
            throw new AccessDeniedException("You are not authorized to assign subjects to courses outside your assigned department");
        }

        if (subjectDao.existsByCode(subject.getSubjectCode(), id)) {
            throw new DuplicateResourceException("Subject code '" + subject.getSubjectCode() + "' is already in use");
        }

        existing.setSubjectCode(subject.getSubjectCode());
        existing.setSubjectName(subject.getSubjectName());
        existing.setCourseId(subject.getCourseId());
        existing.setSemester(subject.getSemester());
        existing.setCredits(subject.getCredits());
        subjectDao.update(existing);
        return existing;
    }

    public void deleteSubject(Long id) {
        Subject existing = subjectDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));

        Long enforcedDept = getEnforcedFacultyDepartmentId();
        if (enforcedDept != null && !enforcedDept.equals(existing.getDepartmentId())) {
            throw new AccessDeniedException("You are not authorized to delete subjects outside your assigned department");
        }

        subjectDao.deleteById(id);
    }
}
