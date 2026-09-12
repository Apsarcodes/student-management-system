package com.sms.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Marks {
    private Long id;
    private Long studentId;
    private Long subjectId;
    private BigDecimal internalMarks;
    private BigDecimal assignmentMarks;
    private BigDecimal examMarks;
    private BigDecimal totalMarks;
    private BigDecimal percentage;
    private String grade;
    private Long recordedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Joined fields
    private String studentName;
    private String studentRegistrationId;
    private String subjectName;
    private String subjectCode;
    private String courseName;
    private Integer semester;

    public Marks() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public BigDecimal getInternalMarks() { return internalMarks; }
    public void setInternalMarks(BigDecimal internalMarks) { this.internalMarks = internalMarks; }

    public BigDecimal getAssignmentMarks() { return assignmentMarks; }
    public void setAssignmentMarks(BigDecimal assignmentMarks) { this.assignmentMarks = assignmentMarks; }

    public BigDecimal getExamMarks() { return examMarks; }
    public void setExamMarks(BigDecimal examMarks) { this.examMarks = examMarks; }

    public BigDecimal getTotalMarks() { return totalMarks; }
    public void setTotalMarks(BigDecimal totalMarks) { this.totalMarks = totalMarks; }

    public BigDecimal getPercentage() { return percentage; }
    public void setPercentage(BigDecimal percentage) { this.percentage = percentage; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public Long getRecordedBy() { return recordedBy; }
    public void setRecordedBy(Long recordedBy) { this.recordedBy = recordedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentRegistrationId() { return studentRegistrationId; }
    public void setStudentRegistrationId(String studentRegistrationId) { this.studentRegistrationId = studentRegistrationId; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
}
