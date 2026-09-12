package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.dto.AttendanceRequest;
import com.sms.model.Attendance;
import com.sms.model.User;
import com.sms.service.AttendanceService;
import com.sms.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class AttendanceController {
    private final AttendanceService attendanceService;
    private final AuthService authService;

    public AttendanceController(AttendanceService attendanceService, AuthService authService) {
        this.attendanceService = attendanceService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Attendance>>> getAttendance(
            @RequestParam Long subjectId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        List<Attendance> list = attendanceService.getAttendanceBySubjectAndDate(subjectId, date);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> recordAttendance(@Valid @RequestBody AttendanceRequest request) {
        User currentUser = authService.getCurrentUser();
        attendanceService.recordBulkAttendance(request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Attendance saved successfully", null));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<Attendance>>> getStudentAttendance(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getAttendanceByStudentId(studentId)));
    }

    @GetMapping("/low")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getLowAttendanceStudents(
            @RequestParam(defaultValue = "75.0") double threshold
    ) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getLowAttendanceStudents(threshold)));
    }
}
