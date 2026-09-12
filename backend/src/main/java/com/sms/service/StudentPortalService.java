package com.sms.service;

import com.sms.dao.AttendanceDao;
import com.sms.dao.CourseDao;
import com.sms.dao.MarksDao;
import com.sms.dao.StudentDao;
import com.sms.dao.SubjectDao;
import com.sms.dto.StudentContactUpdateDto;
import com.sms.exception.ResourceNotFoundException;
import com.sms.model.Attendance;
import com.sms.model.Marks;
import com.sms.model.Student;
import com.sms.model.Subject;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class StudentPortalService {

    private final StudentDao studentDao;
    private final AttendanceDao attendanceDao;
    private final MarksDao marksDao;
    private final SubjectDao subjectDao;
    private final CourseDao courseDao;

    public StudentPortalService(
            StudentDao studentDao,
            AttendanceDao attendanceDao,
            MarksDao marksDao,
            SubjectDao subjectDao,
            CourseDao courseDao
    ) {
        this.studentDao = studentDao;
        this.attendanceDao = attendanceDao;
        this.marksDao = marksDao;
        this.subjectDao = subjectDao;
        this.courseDao = courseDao;
    }

    public Map<String, Object> getDashboard(Long studentId) {
        Student student = studentDao.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        Map<String, Object> attSummary = attendanceDao.getStudentAttendanceSummary(studentId);
        double attPct = ((Number) attSummary.getOrDefault("attendancePercentage", 0.0)).doubleValue();
        attSummary.put("isLowAttendance", attPct < 75.0);

        List<Marks> allMarks = marksDao.findByStudentId(studentId);
        BigDecimal sumMarks = BigDecimal.ZERO;
        int evaluatedCount = 0;
        for (Marks m : allMarks) {
            if (m.getPercentage() != null) {
                sumMarks = sumMarks.add(m.getPercentage());
                evaluatedCount++;
            }
        }

        BigDecimal avgPercentage = evaluatedCount > 0
                ? sumMarks.divide(BigDecimal.valueOf(evaluatedCount), 1, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        double gpa = calculateGpa(avgPercentage.doubleValue());

        List<Subject> enrolledSubjects = Collections.emptyList();
        int totalCredits = 0;
        if (student.getCourseId() != null && student.getSemester() != null) {
            enrolledSubjects = subjectDao.findAll(student.getCourseId(), student.getSemester());
            for (Subject s : enrolledSubjects) {
                totalCredits += s.getCredits();
            }
        }

        List<Attendance> allAttendance = attendanceDao.findByStudentId(studentId);
        List<Attendance> recentAttendance = allAttendance.stream().limit(5).toList();
        List<Marks> recentMarks = allMarks.stream().limit(5).toList();

        Map<String, Object> academics = new HashMap<>();
        academics.put("averagePercentage", avgPercentage);
        academics.put("gpa", gpa);
        academics.put("evaluatedSubjectsCount", evaluatedCount);
        academics.put("enrolledSubjectsCount", enrolledSubjects.size());
        academics.put("totalCredits", totalCredits);

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("student", student);
        dashboard.put("attendance", attSummary);
        dashboard.put("academics", academics);
        dashboard.put("recentMarks", recentMarks);
        dashboard.put("recentAttendance", recentAttendance);

        return dashboard;
    }

    public Student getProfile(Long studentId) {
        return studentDao.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));
    }

    public Student updateContactInfo(Long studentId, StudentContactUpdateDto dto) {
        if (!studentDao.findById(studentId).isPresent()) {
            throw new ResourceNotFoundException("Student not found with id: " + studentId);
        }
        studentDao.updateContactInfo(studentId, dto.getPhone(), dto.getAddress());
        return studentDao.findById(studentId).orElse(null);
    }

    public Map<String, Object> getAttendanceDetails(Long studentId) {
        if (!studentDao.findById(studentId).isPresent()) {
            throw new ResourceNotFoundException("Student not found with id: " + studentId);
        }
        Map<String, Object> summary = attendanceDao.getStudentAttendanceSummary(studentId);
        double attPct = ((Number) summary.getOrDefault("attendancePercentage", 0.0)).doubleValue();
        summary.put("isLowAttendance", attPct < 75.0);

        List<Map<String, Object>> subjectWise = attendanceDao.getSubjectAttendanceForStudent(studentId);
        List<Attendance> history = attendanceDao.findByStudentId(studentId);

        Map<String, Object> result = new HashMap<>();
        result.put("summary", summary);
        result.put("subjectWise", subjectWise);
        result.put("history", history);
        return result;
    }

    public Map<String, Object> getMarksDetails(Long studentId) {
        Student student = studentDao.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        List<Marks> marks = marksDao.findByStudentId(studentId);

        BigDecimal sumPct = BigDecimal.ZERO;
        int count = 0;
        Marks highest = null;
        Marks lowest = null;

        for (Marks m : marks) {
            if (m.getPercentage() != null) {
                sumPct = sumPct.add(m.getPercentage());
                count++;
                if (highest == null || m.getPercentage().compareTo(highest.getPercentage()) > 0) {
                    highest = m;
                }
                if (lowest == null || m.getPercentage().compareTo(lowest.getPercentage()) < 0) {
                    lowest = m;
                }
            }
        }

        BigDecimal avgPct = count > 0
                ? sumPct.divide(BigDecimal.valueOf(count), 1, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Map<String, Object> stats = new HashMap<>();
        stats.put("averagePercentage", avgPct);
        stats.put("gpa", calculateGpa(avgPct.doubleValue()));
        stats.put("totalEvaluated", count);
        stats.put("highestScore", highest != null ? highest.getPercentage() : null);
        stats.put("highestSubject", highest != null ? highest.getSubjectName() : null);
        stats.put("lowestScore", lowest != null ? lowest.getPercentage() : null);
        stats.put("lowestSubject", lowest != null ? lowest.getSubjectName() : null);

        Map<String, Object> result = new HashMap<>();
        result.put("marks", marks);
        result.put("stats", stats);
        return result;
    }

    public List<Subject> getEnrolledSubjects(Long studentId) {
        Student student = studentDao.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        if (student.getCourseId() == null || student.getSemester() == null) {
            return Collections.emptyList();
        }
        return subjectDao.findAll(student.getCourseId(), student.getSemester());
    }

    private double calculateGpa(double percentage) {
        if (percentage >= 90) return 4.0;
        if (percentage >= 80) return 3.5;
        if (percentage >= 70) return 3.0;
        if (percentage >= 60) return 2.5;
        if (percentage >= 50) return 2.0;
        if (percentage > 0) return 1.0;
        return 0.0;
    }
}
