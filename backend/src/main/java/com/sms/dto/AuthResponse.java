package com.sms.dto;

public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private Long studentId;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;

    public AuthResponse() {}

    public AuthResponse(String token, Long id, String username, String email, String fullName, String role) {
        this(token, id, username, email, fullName, role, null, null, null, null);
    }

    public AuthResponse(String token, Long id, String username, String email, String fullName, String role, Long studentId) {
        this(token, id, username, email, fullName, role, studentId, null, null, null);
    }

    public AuthResponse(String token, Long id, String username, String email, String fullName, String role, Long studentId, Long departmentId, String departmentName, String departmentCode) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.studentId = studentId;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.departmentCode = departmentCode;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }
}
