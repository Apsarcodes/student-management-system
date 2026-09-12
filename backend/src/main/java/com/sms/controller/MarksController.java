package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.dto.MarksRequest;
import com.sms.model.Marks;
import com.sms.model.User;
import com.sms.service.AuthService;
import com.sms.service.MarksService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marks")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class MarksController {
    private final MarksService marksService;
    private final AuthService authService;

    public MarksController(MarksService marksService, AuthService authService) {
        this.marksService = marksService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Marks>>> getMarksBySubject(@RequestParam Long subjectId) {
        return ResponseEntity.ok(ApiResponse.success(marksService.getMarksBySubject(subjectId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> recordMarks(@Valid @RequestBody MarksRequest request) {
        User currentUser = authService.getCurrentUser();
        marksService.recordBulkMarks(request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Marks recorded successfully", null));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<Marks>>> getStudentMarks(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(marksService.getMarksByStudentId(studentId)));
    }

    @GetMapping("/grades")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getGradeDistribution() {
        return ResponseEntity.ok(ApiResponse.success(marksService.getGradeDistribution()));
    }
}
