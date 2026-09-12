package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.dto.StudentContactUpdateDto;
import com.sms.exception.BadRequestException;
import com.sms.model.Student;
import com.sms.model.Subject;
import com.sms.security.CustomUserDetails;
import com.sms.service.StudentPortalService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student/portal")
@PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
public class StudentPortalController {

    private final StudentPortalService portalService;
    private final com.sms.dao.UserDao userDao;

    public StudentPortalController(StudentPortalService portalService, com.sms.dao.UserDao userDao) {
        this.portalService = portalService;
        this.userDao = userDao;
    }

    private Long resolveStudentId(CustomUserDetails userDetails, Long paramStudentId) {
        if ("ADMIN".equalsIgnoreCase(userDetails.getRole()) && paramStudentId != null) {
            return paramStudentId;
        }
        Long sid = userDetails.getStudentId();
        if (sid == null && userDetails.getId() != null) {
            sid = userDao.findById(userDetails.getId()).map(com.sms.model.User::getStudentId).orElse(null);
        }
        if (sid == null) {
            throw new BadRequestException("Your student registration is pending administrator approval. Please wait for an administrator to approve your account.");
        }
        return sid;
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPortalStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long sid = userDetails.getStudentId();
        com.sms.model.User currentUser = null;
        if (userDetails.getId() != null) {
            currentUser = userDao.findById(userDetails.getId()).orElse(null);
            if (currentUser != null && currentUser.getStudentId() != null) {
                sid = currentUser.getStudentId();
            }
        }
        Map<String, Object> status = new java.util.HashMap<>();
        status.put("linked", sid != null);
        status.put("studentId", sid);
        status.put("message", sid != null ? "Student account is active" : "Your student registration is pending administrator approval.");
        if (currentUser != null) {
            currentUser.setPasswordHash(null);
            status.put("user", currentUser);
        }
        return ResponseEntity.ok(ApiResponse.success(status));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) Long studentId
    ) {
        Long targetId = resolveStudentId(userDetails, studentId);
        return ResponseEntity.ok(ApiResponse.success(portalService.getDashboard(targetId)));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Student>> getProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) Long studentId
    ) {
        Long targetId = resolveStudentId(userDetails, studentId);
        return ResponseEntity.ok(ApiResponse.success(portalService.getProfile(targetId)));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Student>> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody StudentContactUpdateDto dto,
            @RequestParam(required = false) Long studentId
    ) {
        Long targetId = resolveStudentId(userDetails, studentId);
        Student updated = portalService.updateContactInfo(targetId, dto);
        return ResponseEntity.ok(ApiResponse.success("Contact information updated successfully", updated));
    }

    @GetMapping("/attendance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAttendance(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) Long studentId
    ) {
        Long targetId = resolveStudentId(userDetails, studentId);
        return ResponseEntity.ok(ApiResponse.success(portalService.getAttendanceDetails(targetId)));
    }

    @GetMapping("/marks")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMarks(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) Long studentId
    ) {
        Long targetId = resolveStudentId(userDetails, studentId);
        return ResponseEntity.ok(ApiResponse.success(portalService.getMarksDetails(targetId)));
    }

    @GetMapping("/subjects")
    public ResponseEntity<ApiResponse<List<Subject>>> getEnrolledSubjects(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) Long studentId
    ) {
        Long targetId = resolveStudentId(userDetails, studentId);
        return ResponseEntity.ok(ApiResponse.success(portalService.getEnrolledSubjects(targetId)));
    }
}
