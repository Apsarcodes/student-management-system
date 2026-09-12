package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.dto.PendingStudentResponse;
import com.sms.dto.StudentDto;
import com.sms.dto.UserDto;
import com.sms.model.Student;
import com.sms.model.User;
import com.sms.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers()));
    }

    @GetMapping("/pending-students")
    public ResponseEntity<ApiResponse<List<PendingStudentResponse>>> getPendingStudents() {
        return ResponseEntity.ok(ApiResponse.success(userService.getPendingStudentRequests()));
    }

    @GetMapping("/unlinked-students")
    public ResponseEntity<ApiResponse<List<Student>>> getUnlinkedStudents(
            @RequestParam(required = false) Long departmentId
    ) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUnlinkedStudents(departmentId)));
    }

    @PostMapping("/{userId}/link-student/{studentId}")
    public ResponseEntity<ApiResponse<User>> linkStudent(
            @PathVariable Long userId,
            @PathVariable Long studentId
    ) {
        User updated = userService.linkStudentToUser(userId, studentId);
        return ResponseEntity.ok(ApiResponse.success("Student account successfully linked and activated", updated));
    }

    @PostMapping("/{userId}/approve-and-create-student")
    public ResponseEntity<ApiResponse<User>> approveAndCreateStudent(
            @PathVariable Long userId,
            @Valid @RequestBody StudentDto studentDto
    ) {
        User updated = userService.createAndLinkStudent(userId, studentDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Student record created and user account linked successfully", updated));
    }

    @PostMapping("/{userId}/quick-approve")
    public ResponseEntity<ApiResponse<User>> quickApproveStudent(@PathVariable Long userId) {
        User updated = userService.quickApproveStudent(userId);
        return ResponseEntity.ok(ApiResponse.success("Student registration approved and enrolled successfully", updated));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<User>> createUser(@Valid @RequestBody UserDto dto) {
        User created = userService.createUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(@PathVariable Long id, @Valid @RequestBody UserDto dto) {
        User updated = userService.updateUser(id, dto);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }
}
