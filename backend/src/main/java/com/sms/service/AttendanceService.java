package com.sms.service;

import com.sms.dao.AttendanceDao;
import com.sms.dao.SubjectDao;
import com.sms.dto.AttendanceRequest;
import com.sms.exception.ResourceNotFoundException;
import com.sms.model.Attendance;
import com.sms.model.Subject;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class AttendanceService {
    private final AttendanceDao attendanceDao;
    private final SubjectDao subjectDao;
    private final AuthService authService;

    public AttendanceService(AttendanceDao attendanceDao, SubjectDao subjectDao, AuthService authService) {
        this.attendanceDao = attendanceDao;
        this.subjectDao = subjectDao;
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

    @Transactional
    public void recordBulkAttendance(AttendanceRequest request, Long recordedByUserId) {
        Subject subject = subjectDao.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + request.getSubjectId()));

        Long enforcedDept = getEnforcedFacultyDepartmentId();
        if (enforcedDept != null && !enforcedDept.equals(subject.getDepartmentId())) {
            throw new AccessDeniedException("You are not authorized to record attendance for subjects outside your assigned department");
        }

        LocalDate date = request.getAttendanceDate();
        for (AttendanceRequest.AttendanceItem item : request.getItems()) {
            attendanceDao.upsert(
                    item.getStudentId(),
                    request.getSubjectId(),
                    date,
                    item.getStatus().toUpperCase().trim(),
                    item.getRemarks(),
                    recordedByUserId
            );
        }
    }

    public List<Attendance> getAttendanceBySubjectAndDate(Long subjectId, LocalDate date) {
        Long enforcedDept = getEnforcedFacultyDepartmentId();
        if (enforcedDept != null) {
            Subject subject = subjectDao.findById(subjectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + subjectId));
            if (!enforcedDept.equals(subject.getDepartmentId())) {
                throw new AccessDeniedException("You are not authorized to view attendance for subjects outside your assigned department");
            }
        }
        return attendanceDao.findBySubjectAndDate(subjectId, date);
    }

    public List<Attendance> getAttendanceByStudentId(Long studentId) {
        return attendanceDao.findByStudentId(studentId);
    }

    public Map<String, Object> getStudentAttendanceSummary(Long studentId) {
        return attendanceDao.getStudentAttendanceSummary(studentId);
    }

    public List<Map<String, Object>> getLowAttendanceStudents(double threshold) {
        Long enforcedDept = getEnforcedFacultyDepartmentId();
        return attendanceDao.getLowAttendanceStudents(threshold, enforcedDept);
    }
}
