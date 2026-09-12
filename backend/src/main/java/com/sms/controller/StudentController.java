package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.dto.StudentDto;
import com.sms.model.Student;
import com.sms.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class StudentController {
    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Integer academicYear,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Map<String, Object> result = studentService.getStudents(
                search, departmentId, courseId, academicYear, semester, status,
                sortBy, sortDirection, page, size
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Student>> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(studentService.getStudentById(id)));
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStudentProfile(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(studentService.getStudentProfile(id)));
    }

    @GetMapping("/by-class")
    public ResponseEntity<ApiResponse<List<Student>>> getStudentsByClass(
            @RequestParam Long courseId,
            @RequestParam Integer semester
    ) {
        return ResponseEntity.ok(ApiResponse.success(studentService.getStudentsByClass(courseId, semester)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Student>> createStudent(@Valid @RequestBody StudentDto dto) {
        Student created = studentService.createStudent(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Student created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Student>> updateStudent(@PathVariable Long id, @Valid @RequestBody StudentDto dto) {
        Student updated = studentService.updateStudent(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Student updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.success("Student deleted successfully", null));
    }
}
