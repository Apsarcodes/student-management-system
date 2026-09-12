package com.sms.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Centralized grading service/utility to calculate totals, percentages, and letter grades.
 */
public final class GradeCalculator {
    private GradeCalculator() {}

    public static BigDecimal calculateTotal(BigDecimal internal, BigDecimal assignment, BigDecimal exam) {
        BigDecimal intMarks = internal != null ? internal : BigDecimal.ZERO;
        BigDecimal assignMarks = assignment != null ? assignment : BigDecimal.ZERO;
        BigDecimal examMarks = exam != null ? exam : BigDecimal.ZERO;
        return intMarks.add(assignMarks).add(examMarks).setScale(2, RoundingMode.HALF_UP);
    }

    public static BigDecimal calculatePercentage(BigDecimal total, BigDecimal maxMarks) {
        if (total == null || maxMarks == null || maxMarks.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return total.multiply(new BigDecimal("100"))
                .divide(maxMarks, 2, RoundingMode.HALF_UP);
    }

    public static String calculateGrade(BigDecimal percentage) {
        if (percentage == null) {
            return "F";
        }
        double val = percentage.doubleValue();
        if (val >= 90.0) {
            return "A+";
        } else if (val >= 80.0) {
            return "A";
        } else if (val >= 70.0) {
            return "B+";
        } else if (val >= 60.0) {
            return "B";
        } else if (val >= 50.0) {
            return "C";
        } else {
            return "F";
        }
    }
}
