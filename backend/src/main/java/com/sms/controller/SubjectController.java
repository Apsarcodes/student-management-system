package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.model.Subject;
import com.sms.service.SubjectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {
    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Subject>>> getAllSubjects(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Integer semester
    ) {
        return ResponseEntity.ok(ApiResponse.success(subjectService.getAllSubjects(courseId, semester)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Subject>> getSubjectById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(subjectService.getSubjectById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Subject>> createSubject(@RequestBody Subject subject) {
        Subject created = subjectService.createSubject(subject);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Subject created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Subject>> updateSubject(@PathVariable Long id, @RequestBody Subject subject) {
        Subject updated = subjectService.updateSubject(id, subject);
        return ResponseEntity.ok(ApiResponse.success("Subject updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable Long id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.ok(ApiResponse.success("Subject deleted successfully", null));
    }
}
