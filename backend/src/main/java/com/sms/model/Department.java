package com.sms.model;

import java.time.LocalDateTime;

public class Department {
    private Long id;
    private String code;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Associated counts for UI
    private Integer courseCount;
    private Integer studentCount;

    public Department() {}

    public Department(Long id, String code, String name, String description, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Integer getCourseCount() { return courseCount; }
    public void setCourseCount(Integer courseCount) { this.courseCount = courseCount; }

    public Integer getStudentCount() { return studentCount; }
    public void setStudentCount(Integer studentCount) { this.studentCount = studentCount; }
}
