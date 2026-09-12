package com.sms.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class AttendanceRequest {
    @NotNull(message = "Subject is required")
    private Long subjectId;

    @NotNull(message = "Attendance date is required")
    private LocalDate attendanceDate;

    @NotEmpty(message = "Attendance entries cannot be empty")
    @Valid
    private List<AttendanceItem> items;

    public static class AttendanceItem {
        @NotNull(message = "Student ID is required")
        private Long studentId;

        @NotNull(message = "Status is required")
        private String status; // 'PRESENT', 'ABSENT'

        private String remarks;

        public AttendanceItem() {}

        public AttendanceItem(Long studentId, String status, String remarks) {
            this.studentId = studentId;
            this.status = status;
            this.remarks = remarks;
        }

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }

    public AttendanceRequest() {}

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public LocalDate getAttendanceDate() { return attendanceDate; }
    public void setAttendanceDate(LocalDate attendanceDate) { this.attendanceDate = attendanceDate; }

    public List<AttendanceItem> getItems() { return items; }
    public void setItems(List<AttendanceItem> items) { this.items = items; }
}
