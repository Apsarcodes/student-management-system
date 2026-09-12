package com.sms.dao;

import com.sms.model.Attendance;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class AttendanceDao {
    private final JdbcTemplate jdbcTemplate;

    public AttendanceDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Attendance> attendanceRowMapper = (rs, rowNum) -> {
        Attendance a = new Attendance();
        a.setId(rs.getLong("id"));
        a.setStudentId(rs.getLong("student_id"));
        a.setSubjectId(rs.getLong("subject_id"));
        Date d = rs.getDate("attendance_date");
        if (d != null) a.setAttendanceDate(d.toLocalDate());
        a.setStatus(rs.getString("status"));
        a.setRemarks(rs.getString("remarks"));
        long rec = rs.getLong("recorded_by");
        if (!rs.wasNull()) a.setRecordedBy(rec);

        try {
            a.setStudentName(rs.getString("student_name"));
            a.setStudentRegistrationId(rs.getString("student_reg_id"));
            a.setSubjectName(rs.getString("subject_name"));
            a.setSubjectCode(rs.getString("subject_code"));
            a.setRecordedByName(rs.getString("recorded_by_name"));
        } catch (Exception ignored) {}

        return a;
    };

    public Optional<Attendance> findByStudentSubjectAndDate(Long studentId, Long subjectId, LocalDate date) {
        String sql = "SELECT a.*, " +
                "CONCAT(s.first_name, ' ', s.last_name) AS student_name, s.student_id AS student_reg_id, " +
                "sub.subject_name, sub.subject_code, u.full_name AS recorded_by_name " +
                "FROM attendance a " +
                "JOIN students s ON a.student_id = s.id " +
                "JOIN subjects sub ON a.subject_id = sub.id " +
                "LEFT JOIN users u ON a.recorded_by = u.id " +
                "WHERE a.student_id = ? AND a.subject_id = ? AND a.attendance_date = ?";
        try {
            Attendance a = jdbcTemplate.queryForObject(sql, attendanceRowMapper, studentId, subjectId, Date.valueOf(date));
            return Optional.ofNullable(a);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public void upsert(Long studentId, Long subjectId, LocalDate date, String status, String remarks, Long recordedBy) {
        Optional<Attendance> existing = findByStudentSubjectAndDate(studentId, subjectId, date);
        if (existing.isPresent()) {
            String updateSql = "UPDATE attendance SET status = ?, remarks = ?, recorded_by = ? WHERE id = ?";
            jdbcTemplate.update(updateSql, status, remarks, recordedBy, existing.get().getId());
        } else {
            String insertSql = "INSERT INTO attendance (student_id, subject_id, attendance_date, status, remarks, recorded_by) " +
                    "VALUES (?, ?, ?, ?, ?, ?)";
            jdbcTemplate.update(insertSql, studentId, subjectId, Date.valueOf(date), status, remarks, recordedBy);
        }
    }

    public List<Attendance> findBySubjectAndDate(Long subjectId, LocalDate date) {
        String sql = "SELECT a.*, " +
                "CONCAT(s.first_name, ' ', s.last_name) AS student_name, s.student_id AS student_reg_id, " +
                "sub.subject_name, sub.subject_code, u.full_name AS recorded_by_name " +
                "FROM attendance a " +
                "JOIN students s ON a.student_id = s.id " +
                "JOIN subjects sub ON a.subject_id = sub.id " +
                "LEFT JOIN users u ON a.recorded_by = u.id " +
                "WHERE a.subject_id = ? AND a.attendance_date = ? " +
                "ORDER BY s.student_id ASC";
        return jdbcTemplate.query(sql, attendanceRowMapper, subjectId, Date.valueOf(date));
    }

    public List<Attendance> findByStudentId(Long studentId) {
        String sql = "SELECT a.*, " +
                "CONCAT(s.first_name, ' ', s.last_name) AS student_name, s.student_id AS student_reg_id, " +
                "sub.subject_name, sub.subject_code, u.full_name AS recorded_by_name " +
                "FROM attendance a " +
                "JOIN students s ON a.student_id = s.id " +
                "JOIN subjects sub ON a.subject_id = sub.id " +
                "LEFT JOIN users u ON a.recorded_by = u.id " +
                "WHERE a.student_id = ? " +
                "ORDER BY a.attendance_date DESC";
        return jdbcTemplate.query(sql, attendanceRowMapper, studentId);
    }

    public Map<String, Object> getStudentAttendanceSummary(Long studentId) {
        String sql = "SELECT " +
                "COUNT(*) AS total_classes, " +
                "COALESCE(SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END), 0) AS present_count, " +
                "COALESCE(SUM(CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END), 0) AS absent_count " +
                "FROM attendance WHERE student_id = ?";

        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
            Map<String, Object> map = new HashMap<>();
            long total = rs.getLong("total_classes");
            long present = rs.getLong("present_count");
            long absent = rs.getLong("absent_count");
            double pct = total > 0 ? Math.round((present * 100.0 / total) * 10.0) / 10.0 : 0.0;
            map.put("totalClasses", total);
            map.put("presentCount", present);
            map.put("absentCount", absent);
            map.put("attendancePercentage", pct);
            return map;
        }, studentId);
    }

    public List<Map<String, Object>> getSubjectAttendanceForStudent(Long studentId) {
        String sql = "SELECT sub.id AS subject_id, sub.subject_code, sub.subject_name, " +
                "COUNT(a.id) AS total_classes, " +
                "SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) AS present_count, " +
                "SUM(CASE WHEN a.status = 'ABSENT' THEN 1 ELSE 0 END) AS absent_count " +
                "FROM attendance a " +
                "JOIN subjects sub ON a.subject_id = sub.id " +
                "WHERE a.student_id = ? " +
                "GROUP BY sub.id, sub.subject_code, sub.subject_name " +
                "ORDER BY sub.subject_name ASC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> map = new HashMap<>();
            long total = rs.getLong("total_classes");
            long present = rs.getLong("present_count");
            long absent = rs.getLong("absent_count");
            double pct = total > 0 ? Math.round((present * 100.0 / total) * 10.0) / 10.0 : 0.0;

            map.put("subjectId", rs.getLong("subject_id"));
            map.put("subjectCode", rs.getString("subject_code"));
            map.put("subjectName", rs.getString("subject_name"));
            map.put("totalClasses", total);
            map.put("presentCount", present);
            map.put("absentCount", absent);
            map.put("attendancePercentage", pct);
            return map;
        }, studentId);
    }

    public List<Map<String, Object>> getLowAttendanceStudents(double threshold) {
        return getLowAttendanceStudents(threshold, null);
    }

    public List<Map<String, Object>> getLowAttendanceStudents(double threshold, Long departmentId) {
        StringBuilder sql = new StringBuilder(
                "SELECT s.id, s.student_id, CONCAT(s.first_name, ' ', s.last_name) AS student_name, " +
                "s.email, d.name AS department_name, c.course_name, " +
                "COUNT(a.id) AS total_classes, " +
                "SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) AS present_count, " +
                "ROUND(SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) * 100.0 / COUNT(a.id), 1) AS attendance_pct " +
                "FROM students s " +
                "JOIN attendance a ON s.id = a.student_id " +
                "JOIN departments d ON s.department_id = d.id " +
                "JOIN courses c ON s.course_id = c.id " +
                "WHERE s.status = 'Active' "
        );

        List<Object> params = new ArrayList<>();
        if (departmentId != null) {
            sql.append("AND s.department_id = ? ");
            params.add(departmentId);
        }
        sql.append("GROUP BY s.id, s.student_id, s.first_name, s.last_name, s.email, d.name, c.course_name ");
        sql.append("HAVING COUNT(a.id) > 0 AND (SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) * 100.0 / COUNT(a.id)) < ? ");
        params.add(threshold);
        sql.append("ORDER BY attendance_pct ASC");

        return jdbcTemplate.query(sql.toString(), (rs, rowNum) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", rs.getLong("id"));
            map.put("studentId", rs.getString("student_id"));
            map.put("studentName", rs.getString("student_name"));
            map.put("email", rs.getString("email"));
            map.put("departmentName", rs.getString("department_name"));
            map.put("courseName", rs.getString("course_name"));
            map.put("totalClasses", rs.getLong("total_classes"));
            map.put("presentCount", rs.getLong("present_count"));
            map.put("attendancePercentage", rs.getDouble("attendance_pct"));
            return map;
        }, params.toArray());
    }
}
