package com.sms;

import com.sms.service.GradingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GradingServiceTest {

    private GradingService gradingService;

    @BeforeEach
    void setUp() {
        gradingService = new GradingService();
    }

    @Test
    void testTotalAndGradeCalculations() {
        BigDecimal internal = new BigDecimal("18.00");
        BigDecimal assignment = new BigDecimal("19.00");
        BigDecimal exam = new BigDecimal("55.00");

        BigDecimal total = gradingService.calculateTotal(internal, assignment, exam);
        assertEquals(new BigDecimal("92.00"), total);

        BigDecimal percentage = gradingService.calculatePercentage(total);
        assertEquals(new BigDecimal("92.00"), percentage);

        String grade = gradingService.calculateGrade(percentage);
        assertEquals("A+", grade);
    }

    @Test
    void testGradingBands() {
        assertEquals("A+", gradingService.calculateGrade(new BigDecimal("95.00")));
        assertEquals("A", gradingService.calculateGrade(new BigDecimal("84.50")));
        assertEquals("B+", gradingService.calculateGrade(new BigDecimal("75.00")));
        assertEquals("B", gradingService.calculateGrade(new BigDecimal("62.00")));
        assertEquals("C", gradingService.calculateGrade(new BigDecimal("52.00")));
        assertEquals("F", gradingService.calculateGrade(new BigDecimal("45.00")));
    }
}
