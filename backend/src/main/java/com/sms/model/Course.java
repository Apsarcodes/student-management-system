package com.sms.model;

import java.time.LocalDateTime;

public class Course {
    private Long id;
    private String courseCode;
    private String courseName;
    private Long departmentId;
    private Integer durationYears;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Joined fields for display
    private String departmentName;
    private String departmentCode;
    private Integer studentCount;
    private Integer subjectCount;

    public Course() {}

    public Course(Long id, String courseCode, String courseName, Long departmentId, Integer durationYears, String description, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.departmentId = departmentId;
        this.durationYears = durationYears;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public Integer getDurationYears() { return durationYears; }
    public void setDurationYears(Integer durationYears) { this.durationYears = durationYears; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

    public Integer getStudentCount() { return studentCount; }
    public void setStudentCount(Integer studentCount) { this.studentCount = studentCount; }

    public Integer getSubjectCount() { return subjectCount; }
    public void setSubjectCount(Integer subjectCount) { this.subjectCount = subjectCount; }
}
