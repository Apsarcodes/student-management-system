package com.sms.service;

import com.sms.util.GradeCalculator;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class GradingService {

    public BigDecimal calculateTotal(BigDecimal internal, BigDecimal assignment, BigDecimal exam) {
        return GradeCalculator.calculateTotal(internal, assignment, exam);
    }

    public BigDecimal calculatePercentage(BigDecimal total) {
        // Max total marks is 100 (Internal 20 + Assignment 20 + Exam 60)
        return GradeCalculator.calculatePercentage(total, new BigDecimal("100"));
    }

    public String calculateGrade(BigDecimal percentage) {
        return GradeCalculator.calculateGrade(percentage);
    }
}
