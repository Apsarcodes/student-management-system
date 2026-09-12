package com.sms.service;

import com.sms.dao.DepartmentDao;
import com.sms.exception.BadRequestException;
import com.sms.exception.DuplicateResourceException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.model.Department;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {
    private final DepartmentDao departmentDao;
    private final AuthService authService;

    public DepartmentService(DepartmentDao departmentDao, AuthService authService) {
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

    public List<Department> getAllDepartments() {
        Long enforcedDept = getEnforcedFacultyDepartmentId();
        if (enforcedDept != null) {
            return departmentDao.findById(enforcedDept)
                    .map(List::of)
                    .orElse(List.of());
        }
        return departmentDao.findAll();
    }

    public Department getDepartmentById(Long id) {
        Long enforcedDept = getEnforcedFacultyDepartmentId();
        if (enforcedDept != null && !enforcedDept.equals(id)) {
            throw new AccessDeniedException("You are not authorized to access departments outside your assigned department");
        }

        return departmentDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
    }

    public Department createDepartment(Department dept) {
        if (departmentDao.existsByCode(dept.getCode(), null)) {
            throw new DuplicateResourceException("Department code '" + dept.getCode() + "' already exists");
        }
        return departmentDao.save(dept);
    }

    public Department updateDepartment(Long id, Department dept) {
        Department existing = departmentDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        if (departmentDao.existsByCode(dept.getCode(), id)) {
            throw new DuplicateResourceException("Department code '" + dept.getCode() + "' is already in use");
        }

        existing.setCode(dept.getCode());
        existing.setName(dept.getName());
        existing.setDescription(dept.getDescription());
        departmentDao.update(existing);
        return existing;
    }

    public void deleteDepartment(Long id) {
        Department dept = departmentDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        int courses = departmentDao.countCourses(id);
        int students = departmentDao.countStudents(id);

        if (courses > 0 || students > 0) {
            throw new BadRequestException("Cannot delete department '" + dept.getName() +
                    "' because it currently has " + courses + " course(s) and " + students + " student(s) assigned to it.");
        }

        departmentDao.deleteById(id);
    }
}
