package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.model.Course;
import com.sms.service.CourseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {
    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Course>>> getAllCourses(
            @RequestParam(required = false) Long departmentId
    ) {
        return ResponseEntity.ok(ApiResponse.success(courseService.getAllCourses(departmentId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Course>> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(courseService.getCourseById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Course>> createCourse(@RequestBody Course course) {
        Course created = courseService.createCourse(course);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Course created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Course>> updateCourse(@PathVariable Long id, @RequestBody Course course) {
        Course updated = courseService.updateCourse(id, course);
        return ResponseEntity.ok(ApiResponse.success("Course updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.success("Course deleted successfully", null));
    }
}
