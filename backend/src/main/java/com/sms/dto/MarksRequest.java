package com.sms.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public class MarksRequest {
    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    @NotEmpty(message = "Marks list cannot be empty")
    @Valid
    private List<MarksItem> items;

    public static class MarksItem {
        @NotNull(message = "Student ID is required")
        private Long studentId;

        @NotNull(message = "Internal marks are required")
        @DecimalMin(value = "0.0", message = "Internal marks cannot be negative")
        @DecimalMax(value = "20.0", message = "Internal marks maximum is 20")
        private BigDecimal internalMarks;

        @NotNull(message = "Assignment marks are required")
        @DecimalMin(value = "0.0", message = "Assignment marks cannot be negative")
        @DecimalMax(value = "20.0", message = "Assignment marks maximum is 20")
        private BigDecimal assignmentMarks;

        @NotNull(message = "Exam marks are required")
        @DecimalMin(value = "0.0", message = "Exam marks cannot be negative")
        @DecimalMax(value = "60.0", message = "Exam marks maximum is 60")
        private BigDecimal examMarks;

        public MarksItem() {}

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }

        public BigDecimal getInternalMarks() { return internalMarks; }
        public void setInternalMarks(BigDecimal internalMarks) { this.internalMarks = internalMarks; }

        public BigDecimal getAssignmentMarks() { return assignmentMarks; }
        public void setAssignmentMarks(BigDecimal assignmentMarks) { this.assignmentMarks = assignmentMarks; }

        public BigDecimal getExamMarks() { return examMarks; }
        public void setExamMarks(BigDecimal examMarks) { this.examMarks = examMarks; }
    }

    public MarksRequest() {}

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public List<MarksItem> getItems() { return items; }
    public void setItems(List<MarksItem> items) { this.items = items; }
}
