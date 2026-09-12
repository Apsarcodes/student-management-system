package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class ReportController {
    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/academic")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAcademicReport(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long courseId
    ) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getAcademicReport(departmentId, courseId)));
    }
}
