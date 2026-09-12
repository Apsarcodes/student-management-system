package com.sms.model;

import java.time.LocalDateTime;

public class Subject {
    private Long id;
    private String subjectCode;
    private String subjectName;
    private Long courseId;
    private Integer semester;
    private Integer credits;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Joined fields
    private String courseName;
    private String courseCode;
    private String departmentName;
    private Long departmentId;

    public Subject() {}

    public Subject(Long id, String subjectCode, String subjectName, Long courseId, Integer semester, Integer credits, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.courseId = courseId;
        this.semester = semester;
        this.credits = credits;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
}
