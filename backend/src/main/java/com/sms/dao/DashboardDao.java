package com.sms.dao;

import com.sms.dto.DashboardStatsDto;
import com.sms.model.Student;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class DashboardDao {
    private final JdbcTemplate jdbcTemplate;
    private final StudentDao studentDao;

    public DashboardDao(JdbcTemplate jdbcTemplate, StudentDao studentDao) {
        this.jdbcTemplate = jdbcTemplate;
        this.studentDao = studentDao;
    }

    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();

        // 1. Total Students
        Long total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM students", Long.class);
        stats.setTotalStudents(total != null ? total : 0);

        // 2. Active Students
        Long active = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM students WHERE status = 'Active'", Long.class);
        stats.setActiveStudents(active != null ? active : 0);

        // 3. Total Departments
        Long depts = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM departments", Long.class);
        stats.setTotalDepartments(depts != null ? depts : 0);

        // 4. Total Courses
        Long courses = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM courses", Long.class);
        stats.setTotalCourses(courses != null ? courses : 0);

        // 5. Average Attendance %
        String avgAttSql = "SELECT ROUND(COALESCE(SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 0), 1) " +
                "FROM attendance";
        Double avgAtt = jdbcTemplate.queryForObject(avgAttSql, Double.class);
        stats.setAverageAttendancePercentage(avgAtt != null ? avgAtt : 0.0);

        // 6. Low Attendance (<75%)
        String lowAttSql = "SELECT COUNT(*) FROM (" +
                "  SELECT a.student_id " +
                "  FROM attendance a " +
                "  JOIN students s ON a.student_id = s.id " +
                "  WHERE s.status = 'Active' " +
                "  GROUP BY a.student_id " +
                "  HAVING (SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) < 75.0" +
                ") AS low_att";
        Long lowAttCount = jdbcTemplate.queryForObject(lowAttSql, Long.class);
        stats.setLowAttendanceCount(lowAttCount != null ? lowAttCount : 0);

        // 7. Live Pending Student Registration Requests
        Long pending = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users WHERE role = 'STUDENT' AND student_id IS NULL", Long.class);
        stats.setPendingRequestsCount(pending != null ? pending : 0);

        // 8. Live Total Faculty Staff Count
        Long faculty = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users WHERE role = 'STAFF'", Long.class);
        stats.setTotalFacultyCount(faculty != null ? faculty : 0);

        // 9. Live Total Curriculum Subjects
        Long subjects = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM subjects", Long.class);
        stats.setTotalSubjectsCount(subjects != null ? subjects : 0);

        // 10. Today Attendance Record Count
        Long todayAtt = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM attendance WHERE attendance_date = CURRENT_DATE", Long.class);
        stats.setTodayAttendanceCount(todayAtt != null ? todayAtt : 0);

        // 11. Students by Department Chart
        String deptChartSql = "SELECT d.name AS label, COUNT(s.id) AS total_count " +
                "FROM departments d " +
                "LEFT JOIN students s ON d.id = s.department_id AND s.status = 'Active' " +
                "GROUP BY d.id, d.name " +
                "ORDER BY total_count DESC";
        List<Map<String, Object>> deptChart = jdbcTemplate.query(deptChartSql, (rs, i) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", rs.getString("label"));
            map.put("value", rs.getLong("total_count"));
            return map;
        });
        stats.setStudentsByDepartment(deptChart);

        // 8. Attendance Overview Chart (Present vs Absent)
        String attOverviewSql = "SELECT status AS name, COUNT(*) AS total_count FROM attendance GROUP BY status";
        List<Map<String, Object>> attChart = jdbcTemplate.query(attOverviewSql, (rs, i) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", rs.getString("name"));
            map.put("value", rs.getLong("total_count"));
            return map;
        });
        stats.setAttendanceOverview(attChart);

        // 9. Grade Distribution Chart
        String gradeSql = "SELECT grade AS name, COUNT(*) AS total_count FROM marks GROUP BY grade ORDER BY grade ASC";
        List<Map<String, Object>> gradeChart = jdbcTemplate.query(gradeSql, (rs, i) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", rs.getString("name"));
            map.put("value", rs.getLong("total_count"));
            return map;
        });
        stats.setGradeDistribution(gradeChart);

        // 10. Status Distribution Chart
        String statusSql = "SELECT status AS name, COUNT(*) AS total_count FROM students GROUP BY status";
        List<Map<String, Object>> statusChart = jdbcTemplate.query(statusSql, (rs, i) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", rs.getString("name"));
            map.put("value", rs.getLong("total_count"));
            return map;
        });
        stats.setStatusDistribution(statusChart);

        // 11. Recent 5 Students
        List<Student> recent = studentDao.searchStudents(null, null, null, null, null, null, "id", "DESC", 0, 5);
        stats.setRecentStudents(recent);

        return stats;
    }

    public DashboardStatsDto getDashboardStatsByDepartment(Long departmentId) {
        DashboardStatsDto stats = new DashboardStatsDto();

        // 1. Total Students in Department
        Long total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM students WHERE department_id = ?", Long.class, departmentId);
        stats.setTotalStudents(total != null ? total : 0);

        // 2. Active Students in Department
        Long active = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM students WHERE department_id = ? AND status = 'Active'", Long.class, departmentId);
        stats.setActiveStudents(active != null ? active : 0);

        // 3. Total Departments (1 for isolated view)
        stats.setTotalDepartments(1L);

        // 4. Total Courses in Department
        Long courses = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM courses WHERE department_id = ?", Long.class, departmentId);
        stats.setTotalCourses(courses != null ? courses : 0);

        // 5. Average Attendance % in Department
        String avgAttSql = "SELECT ROUND(COALESCE(SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 0), 1) " +
                "FROM attendance a " +
                "JOIN students s ON a.student_id = s.id " +
                "WHERE s.department_id = ?";
        Double avgAtt = jdbcTemplate.queryForObject(avgAttSql, Double.class, departmentId);
        stats.setAverageAttendancePercentage(avgAtt != null ? avgAtt : 0.0);

        // 6. Low Attendance (<75%) in Department
        String lowAttSql = "SELECT COUNT(*) FROM (" +
                "  SELECT a.student_id " +
                "  FROM attendance a " +
                "  JOIN students s ON a.student_id = s.id " +
                "  WHERE s.status = 'Active' AND s.department_id = ? " +
                "  GROUP BY a.student_id " +
                "  HAVING (SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) < 75.0" +
                ") AS low_att";
        Long lowAttCount = jdbcTemplate.queryForObject(lowAttSql, Long.class, departmentId);
        stats.setLowAttendanceCount(lowAttCount != null ? lowAttCount : 0);

        // 7. Live Department Faculty Count
        Long faculty = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users WHERE role = 'STAFF' AND department_id = ?", Long.class, departmentId);
        stats.setTotalFacultyCount(faculty != null ? faculty : 0);

        // 8. Live Department Curriculum Subjects
        Long subjects = jdbcTemplate.queryForObject(
                "SELECT COUNT(sub.id) FROM subjects sub JOIN courses c ON sub.course_id = c.id WHERE c.department_id = ?",
                Long.class, departmentId);
        stats.setTotalSubjectsCount(subjects != null ? subjects : 0);

        // 9. Today Department Attendance Count
        Long todayAtt = jdbcTemplate.queryForObject(
                "SELECT COUNT(a.id) FROM attendance a JOIN students s ON a.student_id = s.id WHERE a.attendance_date = CURRENT_DATE AND s.department_id = ?",
                Long.class, departmentId);
        stats.setTodayAttendanceCount(todayAtt != null ? todayAtt : 0);

        // 10. Live Department Pending Student Requests
        Long pending = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE role = 'STUDENT' AND student_id IS NULL AND department_id = ?",
                Long.class, departmentId);
        stats.setPendingRequestsCount(pending != null ? pending : 0);

        // 11. Students by Course Chart in Department
        String courseChartSql = "SELECT c.course_name AS label, COUNT(s.id) AS total_count " +
                "FROM courses c " +
                "LEFT JOIN students s ON c.id = s.course_id AND s.status = 'Active' " +
                "WHERE c.department_id = ? " +
                "GROUP BY c.id, c.course_name " +
                "ORDER BY total_count DESC";
        List<Map<String, Object>> courseChart = jdbcTemplate.query(courseChartSql, (rs, i) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", rs.getString("label"));
            map.put("value", rs.getLong("total_count"));
            return map;
        }, departmentId);
        stats.setStudentsByDepartment(courseChart);

        // 8. Attendance Overview Chart (Present vs Absent) in Department
        String attOverviewSql = "SELECT a.status AS name, COUNT(*) AS total_count " +
                "FROM attendance a " +
                "JOIN students s ON a.student_id = s.id " +
                "WHERE s.department_id = ? " +
                "GROUP BY a.status";
        List<Map<String, Object>> attChart = jdbcTemplate.query(attOverviewSql, (rs, i) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", rs.getString("name"));
            map.put("value", rs.getLong("total_count"));
            return map;
        }, departmentId);
        stats.setAttendanceOverview(attChart);

        // 9. Grade Distribution Chart in Department
        String gradeSql = "SELECT m.grade AS name, COUNT(*) AS total_count " +
                "FROM marks m " +
                "JOIN students s ON m.student_id = s.id " +
                "WHERE s.department_id = ? " +
                "GROUP BY m.grade ORDER BY m.grade ASC";
        List<Map<String, Object>> gradeChart = jdbcTemplate.query(gradeSql, (rs, i) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", rs.getString("name"));
            map.put("value", rs.getLong("total_count"));
            return map;
        }, departmentId);
        stats.setGradeDistribution(gradeChart);

        // 10. Status Distribution Chart in Department
        String statusSql = "SELECT s.status AS name, COUNT(*) AS total_count " +
                "FROM students s " +
                "WHERE s.department_id = ? " +
                "GROUP BY s.status";
        List<Map<String, Object>> statusChart = jdbcTemplate.query(statusSql, (rs, i) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", rs.getString("name"));
            map.put("value", rs.getLong("total_count"));
            return map;
        }, departmentId);
        stats.setStatusDistribution(statusChart);

        // 11. Recent 5 Students in Department
        List<Student> recent = studentDao.searchStudents(null, departmentId, null, null, null, null, "id", "DESC", 0, 5);
        stats.setRecentStudents(recent);

        return stats;
    }
}
