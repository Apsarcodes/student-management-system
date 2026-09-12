package com.sms.service;

import com.sms.dao.AttendanceDao;
import com.sms.dao.MarksDao;
import com.sms.dao.StudentDao;
import com.sms.model.Student;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {
    private final StudentDao studentDao;
    private final AttendanceDao attendanceDao;
    private final MarksDao marksDao;
    private final AuthService authService;

    public ReportService(StudentDao studentDao, AttendanceDao attendanceDao, MarksDao marksDao, AuthService authService) {
        this.studentDao = studentDao;
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

    public Map<String, Object> getAcademicReport(Long departmentId, Long courseId) {
        Long enforcedDept = getEnforcedFacultyDepartmentId();
        if (enforcedDept != null) {
            departmentId = enforcedDept;
        }

        List<Student> students = studentDao.searchStudents(
                null, departmentId, courseId, null, null, null, "name", "ASC", 0, 1000
        );
        List<Map<String, Object>> lowAttendance = attendanceDao.getLowAttendanceStudents(75.0, departmentId);
        List<Map<String, Object>> grades = marksDao.getGradeDistribution(departmentId);

        Map<String, Object> report = new HashMap<>();
        report.put("students", students);
        report.put("totalStudents", students.size());
        report.put("lowAttendanceList", lowAttendance);
        report.put("gradeDistribution", grades);
        return report;
    }
}
