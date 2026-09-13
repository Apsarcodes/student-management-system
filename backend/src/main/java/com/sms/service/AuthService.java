package com.sms.service;

import com.sms.dao.DepartmentDao;
import com.sms.dao.UserDao;
import com.sms.dto.AuthResponse;
import com.sms.dto.ChangePasswordRequest;
import com.sms.dto.LoginRequest;
import com.sms.dto.RegisterRequest;
import com.sms.exception.BadRequestException;
import com.sms.exception.DuplicateResourceException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.model.User;
import com.sms.security.CustomUserDetails;
import com.sms.security.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {
    private final UserDao userDao;
    private final DepartmentDao departmentDao;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;

    public AuthService(UserDao userDao, DepartmentDao departmentDao, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, OtpService otpService) {
        this.userDao = userDao;
        this.departmentDao = departmentDao;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.otpService = otpService;
    }

    public User register(RegisterRequest request) {
        if (userDao.existsByUsername(request.getUsername(), null)) {
            throw new DuplicateResourceException("Username '" + request.getUsername() + "' is already taken");
        }
        if (userDao.existsByEmail(request.getEmail(), null)) {
            throw new DuplicateResourceException("Email '" + request.getEmail() + "' is already registered");
        }

        String role = request.getRole() != null ? request.getRole().toUpperCase().trim() : "STAFF";
        if ("ADMIN".equals(role)) {
            throw new BadRequestException("Public registration for Administrator role is not permitted");
        }
        if (!"STAFF".equals(role) && !"STUDENT".equals(role)) {
            role = "STAFF";
        }

        Long departmentId = request.getDepartmentId();
        if ("STAFF".equals(role)) {
            if (departmentId == null) {
                throw new BadRequestException("Department selection is required for Faculty / Staff registration");
            }
            if (!departmentDao.findById(departmentId).isPresent()) {
                throw new ResourceNotFoundException("Department not found with id: " + departmentId);
            }
        } else if (departmentId != null && !departmentDao.findById(departmentId).isPresent()) {
            throw new ResourceNotFoundException("Department not found with id: " + departmentId);
        }

        User user = new User();
        user.setUsername(request.getUsername().toLowerCase().trim());
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setRole(role);
        user.setStatus("PENDING");
        user.setDepartmentId(departmentId);
        user.setStudentId(request.getStudentId());

        User saved = userDao.save(user);
        User loaded = userDao.findById(saved.getId()).orElse(saved);

        otpService.createAndSendOtp(loaded.getEmail(), "REGISTRATION");
        return loaded;
    }

    public void forgotPassword(String email) {
        String normalizedEmail = email == null ? null : email.trim().toLowerCase();
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            throw new BadRequestException("Email is required.");
        }

        userDao.findByEmail(normalizedEmail).ifPresent(user -> {
            otpService.createAndSendOtp(user.getEmail(), "PASSWORD_RESET");
        });
    }

    public void resendOtp(String email, String purpose) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
        if (normalizedEmail.isBlank()) {
            throw new BadRequestException("Email is required.");
        }

        userDao.findByEmail(normalizedEmail).ifPresent(user -> otpService.resendOtp(user.getEmail(), purpose));
    }

    public Map<String, Object> verifyOtp(String email, String otp, String purpose) {
        otpService.verifyOtp(email, otp, purpose);
        Map<String, Object> result = new HashMap<>();
        result.put("email", email.trim().toLowerCase());
        result.put("purpose", purpose.toUpperCase());
        if ("REGISTRATION".equalsIgnoreCase(purpose)) {
            User user = userDao.findByEmail(email.trim().toLowerCase())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
            user.setStatus("ACTIVE");
            userDao.update(user);
            otpService.deleteOtp(email, purpose);
            result.put("message", "Registration verified successfully. You can now log in.");
            return result;
        }

        otpService.requireVerifiedOtp(email, purpose);
        result.put("message", "OTP verified successfully. Please reset your password.");
        return result;
    }

    public void resetPassword(String email, String newPassword) {
        String normalizedEmail = email == null ? null : email.trim().toLowerCase();
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            throw new BadRequestException("Email is required.");
        }

        otpService.requireVerifiedOtp(normalizedEmail, "PASSWORD_RESET");
        User user = userDao.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + normalizedEmail));

        if (newPassword == null || newPassword.length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters");
        }

        userDao.updatePassword(user.getId(), passwordEncoder.encode(newPassword));
        otpService.deleteOtp(normalizedEmail, "PASSWORD_RESET");
    }

    public AuthResponse login(LoginRequest request) {
        User user = userDao.findByUsernameOrEmail(request.getUsernameOrEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid username/email or password"));

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new BadRequestException("Your account is inactive. Please contact an administrator.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username/email or password");
        }

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtUtil.generateToken(userDetails, request.isRememberMe());

        return new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getStudentId(),
                user.getDepartmentId(),
                user.getDepartmentName(),
                user.getDepartmentCode()
        );
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new BadRequestException("No authenticated user found");
        }

        if (authentication.getPrincipal() instanceof CustomUserDetails cud) {
            return cud.getUser();
        }

        String usernameOrEmail = authentication.getName();
        return userDao.findByUsernameOrEmail(usernameOrEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }

    public User updateProfile(Long userId, String fullName, String email) {
        User user = userDao.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (userDao.existsByEmail(email, userId)) {
            throw new DuplicateResourceException("Email is already taken by another account");
        }

        user.setFullName(fullName);
        user.setEmail(email);
        userDao.update(user);
        return user;
    }

    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userDao.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match");
        }

        userDao.updatePassword(userId, passwordEncoder.encode(request.getNewPassword()));
    }
}
