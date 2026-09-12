package com.sms.controller;

import com.sms.dao.DepartmentDao;
import com.sms.dto.ApiResponse;
import com.sms.dto.AuthResponse;
import com.sms.dto.ChangePasswordRequest;
import com.sms.dto.LoginRequest;
import com.sms.dto.RegisterRequest;
import com.sms.model.Department;
import com.sms.model.User;
import com.sms.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final DepartmentDao departmentDao;

    public AuthController(AuthService authService, DepartmentDao departmentDao) {
        this.authService = authService;
        this.departmentDao = departmentDao;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account registered successfully", response));
    }

    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<Department>>> getPublicDepartments() {
        return ResponseEntity.ok(ApiResponse.success(departmentDao.findAll()));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser() {
        User user = authService.getCurrentUser();
        user.setPasswordHash(null);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<User>> updateProfile(@RequestBody Map<String, String> body) {
        User currentUser = authService.getCurrentUser();
        String fullName = body.get("fullName");
        String email = body.get("email");
        User updated = authService.updateProfile(currentUser.getId(), fullName, email);
        updated.setPasswordHash(null);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        User currentUser = authService.getCurrentUser();
        authService.changePassword(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }
}
