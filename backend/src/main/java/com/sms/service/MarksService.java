package com.sms.service;

import com.sms.dao.MarksDao;
import com.sms.dao.SubjectDao;
import com.sms.dto.MarksRequest;
import com.sms.exception.ResourceNotFoundException;
import com.sms.model.Marks;
import com.sms.model.Subject;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class MarksService {
    private final MarksDao marksDao;
    private final SubjectDao subjectDao;
    private final GradingService gradingService;
    private final AuthService authService;

    public MarksService(MarksDao marksDao, SubjectDao subjectDao, GradingService gradingService, AuthService authService) {
        this.marksDao = marksDao;
        this.subjectDao = subjectDao;
        this.gradingService = gradingService;
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
    public void recordBulkMarks(MarksRequest request, Long recordedByUserId) {
        Subject subject = subjectDao.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + request.getSubjectId()));

        Long enforcedDept = getEnforcedFacultyDepartmentId();
        if (enforcedDept != null && !enforcedDept.equals(subject.getDepartmentId())) {
            throw new AccessDeniedException("You are not authorized to record marks for subjects outside your assigned department");
        }

        for (MarksRequest.MarksItem item : request.getItems()) {
            BigDecimal internal = item.getInternalMarks();
            BigDecimal assignment = item.getAssignmentMarks();
            BigDecimal exam = item.getExamMarks();

            BigDecimal total = gradingService.calculateTotal(internal, assignment, exam);
            BigDecimal percentage = gradingService.calculatePercentage(total);
            String grade = gradingService.calculateGrade(percentage);

            marksDao.upsert(
                    item.getStudentId(),
                    request.getSubjectId(),
                    internal,
                    assignment,
                    exam,
                    total,
                    percentage,
                    grade,
                    recordedByUserId
            );
        }
    }

    public List<Marks> getMarksBySubject(Long subjectId) {
        Long enforcedDept = getEnforcedFacultyDepartmentId();
        if (enforcedDept != null) {
            Subject subject = subjectDao.findById(subjectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + subjectId));
            if (!enforcedDept.equals(subject.getDepartmentId())) {
                throw new AccessDeniedException("You are not authorized to view marks for subjects outside your assigned department");
            }
        }
        return marksDao.findBySubject(subjectId);
    }

    public List<Marks> getMarksByStudentId(Long studentId) {
        return marksDao.findByStudentId(studentId);
    }

    public List<Map<String, Object>> getGradeDistribution() {
        Long enforcedDept = getEnforcedFacultyDepartmentId();
        return marksDao.getGradeDistribution(enforcedDept);
    }
}
