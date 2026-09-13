package com.sms.controller;

import com.sms.dao.DepartmentDao;
import com.sms.dto.*;
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
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody RegisterRequest request) {
        User response = authService.register(request);
        response.setPasswordHash(null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful. Please verify your email to activate your account.", response));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("If an account exists for that email, a reset code has been sent."));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Void>> resendOtp(
            @RequestParam String purpose,
            @Valid @RequestBody ForgotPasswordRequest request
    ) {
        authService.resendOtp(request.getEmail(), purpose);
        return ResponseEntity.ok(ApiResponse.success("A new OTP has been sent."));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        Map<String, Object> result = authService.verifyOtp(request.getEmail(), request.getOtp(), request.getPurpose());
        return ResponseEntity.ok(ApiResponse.success(result.get("message").toString(), result));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getEmail(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Password reset successful. Please log in with your new password."));
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
