package com.sms.dto;

import com.sms.model.Student;
import java.util.List;
import java.util.Map;

public class DashboardStatsDto {
    private long totalStudents;
    private long activeStudents;
    private long totalDepartments;
    private long totalCourses;
    private double averageAttendancePercentage;
    private long lowAttendanceCount;
    private long pendingRequestsCount;
    private long totalFacultyCount;
    private long totalSubjectsCount;
    private long todayAttendanceCount;
    private long lastUpdatedTimestamp = System.currentTimeMillis();

    // Chart Data
    private List<Map<String, Object>> studentsByDepartment;
    private List<Map<String, Object>> attendanceOverview;
    private List<Map<String, Object>> gradeDistribution;
    private List<Map<String, Object>> statusDistribution;

    // Recent activity
    private List<Student> recentStudents;

    public DashboardStatsDto() {}

    public long getPendingRequestsCount() { return pendingRequestsCount; }
    public void setPendingRequestsCount(long pendingRequestsCount) { this.pendingRequestsCount = pendingRequestsCount; }

    public long getTotalFacultyCount() { return totalFacultyCount; }
    public void setTotalFacultyCount(long totalFacultyCount) { this.totalFacultyCount = totalFacultyCount; }

    public long getTotalSubjectsCount() { return totalSubjectsCount; }
    public void setTotalSubjectsCount(long totalSubjectsCount) { this.totalSubjectsCount = totalSubjectsCount; }

    public long getTodayAttendanceCount() { return todayAttendanceCount; }
    public void setTodayAttendanceCount(long todayAttendanceCount) { this.todayAttendanceCount = todayAttendanceCount; }

    public long getLastUpdatedTimestamp() { return lastUpdatedTimestamp; }
    public void setLastUpdatedTimestamp(long lastUpdatedTimestamp) { this.lastUpdatedTimestamp = lastUpdatedTimestamp; }

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getActiveStudents() { return activeStudents; }
    public void setActiveStudents(long activeStudents) { this.activeStudents = activeStudents; }

    public long getTotalDepartments() { return totalDepartments; }
    public void setTotalDepartments(long totalDepartments) { this.totalDepartments = totalDepartments; }

    public long getTotalCourses() { return totalCourses; }
    public void setTotalCourses(long totalCourses) { this.totalCourses = totalCourses; }

    public double getAverageAttendancePercentage() { return averageAttendancePercentage; }
    public void setAverageAttendancePercentage(double averageAttendancePercentage) { this.averageAttendancePercentage = averageAttendancePercentage; }

    public long getLowAttendanceCount() { return lowAttendanceCount; }
    public void setLowAttendanceCount(long lowAttendanceCount) { this.lowAttendanceCount = lowAttendanceCount; }

    public List<Map<String, Object>> getStudentsByDepartment() { return studentsByDepartment; }
    public void setStudentsByDepartment(List<Map<String, Object>> studentsByDepartment) { this.studentsByDepartment = studentsByDepartment; }

    public List<Map<String, Object>> getAttendanceOverview() { return attendanceOverview; }
    public void setAttendanceOverview(List<Map<String, Object>> attendanceOverview) { this.attendanceOverview = attendanceOverview; }

    public List<Map<String, Object>> getGradeDistribution() { return gradeDistribution; }
    public void setGradeDistribution(List<Map<String, Object>> gradeDistribution) { this.gradeDistribution = gradeDistribution; }

    public List<Map<String, Object>> getStatusDistribution() { return statusDistribution; }
    public void setStatusDistribution(List<Map<String, Object>> statusDistribution) { this.statusDistribution = statusDistribution; }

    public List<Student> getRecentStudents() { return recentStudents; }
    public void setRecentStudents(List<Student> recentStudents) { this.recentStudents = recentStudents; }
}
