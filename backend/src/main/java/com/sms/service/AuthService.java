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

@Service
public class AuthService {
    private final UserDao userDao;
    private final DepartmentDao departmentDao;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserDao userDao, DepartmentDao departmentDao, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userDao = userDao;
        this.departmentDao = departmentDao;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest request) {
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
        user.setStatus("ACTIVE");
        user.setDepartmentId(departmentId);
        user.setStudentId(request.getStudentId());

        User saved = userDao.save(user);

        // Fetch user with joined department name & code
        User loaded = userDao.findById(saved.getId()).orElse(saved);

        CustomUserDetails userDetails = new CustomUserDetails(loaded);
        String token = jwtUtil.generateToken(userDetails, false);

        return new AuthResponse(
                token,
                loaded.getId(),
                loaded.getUsername(),
                loaded.getEmail(),
                loaded.getFullName(),
                loaded.getRole(),
                loaded.getStudentId(),
                loaded.getDepartmentId(),
                loaded.getDepartmentName(),
                loaded.getDepartmentCode()
        );
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
