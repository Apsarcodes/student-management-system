package com.sms.dao;

import com.sms.model.Marks;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class MarksDao {
    private final JdbcTemplate jdbcTemplate;

    public MarksDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Marks> marksRowMapper = (rs, rowNum) -> {
        Marks m = new Marks();
        m.setId(rs.getLong("id"));
        m.setStudentId(rs.getLong("student_id"));
        m.setSubjectId(rs.getLong("subject_id"));
        m.setInternalMarks(rs.getBigDecimal("internal_marks"));
        m.setAssignmentMarks(rs.getBigDecimal("assignment_marks"));
        m.setExamMarks(rs.getBigDecimal("exam_marks"));
        m.setTotalMarks(rs.getBigDecimal("total_marks"));
        m.setPercentage(rs.getBigDecimal("percentage"));
        m.setGrade(rs.getString("grade"));
        long rec = rs.getLong("recorded_by");
        if (!rs.wasNull()) m.setRecordedBy(rec);

        Timestamp ct = rs.getTimestamp("created_at");
        if (ct != null) m.setCreatedAt(ct.toLocalDateTime());
        Timestamp ut = rs.getTimestamp("updated_at");
        if (ut != null) m.setUpdatedAt(ut.toLocalDateTime());

        try {
            m.setStudentName(rs.getString("student_name"));
            m.setStudentRegistrationId(rs.getString("student_reg_id"));
            m.setSubjectName(rs.getString("subject_name"));
            m.setSubjectCode(rs.getString("subject_code"));
            m.setCourseName(rs.getString("course_name"));
            m.setSemester(rs.getInt("semester"));
        } catch (Exception ignored) {}

        return m;
    };

    public Optional<Marks> findByStudentAndSubject(Long studentId, Long subjectId) {
        String sql = "SELECT m.*, " +
                "CONCAT(s.first_name, ' ', s.last_name) AS student_name, s.student_id AS student_reg_id, " +
                "sub.subject_name, sub.subject_code, c.course_name, sub.semester " +
                "FROM marks m " +
                "JOIN students s ON m.student_id = s.id " +
                "JOIN subjects sub ON m.subject_id = sub.id " +
                "JOIN courses c ON sub.course_id = c.id " +
                "WHERE m.student_id = ? AND m.subject_id = ?";
        try {
            Marks m = jdbcTemplate.queryForObject(sql, marksRowMapper, studentId, subjectId);
            return Optional.ofNullable(m);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public void upsert(
            Long studentId,
            Long subjectId,
            BigDecimal internal,
            BigDecimal assignment,
            BigDecimal exam,
            BigDecimal total,
            BigDecimal percentage,
            String grade,
            Long recordedBy
    ) {
        Optional<Marks> existing = findByStudentAndSubject(studentId, subjectId);
        LocalDateTime now = LocalDateTime.now();

        if (existing.isPresent()) {
            String updateSql = "UPDATE marks SET internal_marks = ?, assignment_marks = ?, exam_marks = ?, " +
                    "total_marks = ?, percentage = ?, grade = ?, recorded_by = ?, updated_at = ? WHERE id = ?";
            jdbcTemplate.update(updateSql, internal, assignment, exam, total, percentage, grade, recordedBy,
                    Timestamp.valueOf(now), existing.get().getId());
        } else {
            String insertSql = "INSERT INTO marks (student_id, subject_id, internal_marks, assignment_marks, exam_marks, " +
                    "total_marks, percentage, grade, recorded_by, created_at, updated_at) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            jdbcTemplate.update(insertSql, studentId, subjectId, internal, assignment, exam, total, percentage, grade,
                    recordedBy, Timestamp.valueOf(now), Timestamp.valueOf(now));
        }
    }

    public List<Marks> findBySubject(Long subjectId) {
        String sql = "SELECT m.*, " +
                "CONCAT(s.first_name, ' ', s.last_name) AS student_name, s.student_id AS student_reg_id, " +
                "sub.subject_name, sub.subject_code, c.course_name, sub.semester " +
                "FROM marks m " +
                "JOIN students s ON m.student_id = s.id " +
                "JOIN subjects sub ON m.subject_id = sub.id " +
                "JOIN courses c ON sub.course_id = c.id " +
                "WHERE m.subject_id = ? " +
                "ORDER BY s.student_id ASC";
        return jdbcTemplate.query(sql, marksRowMapper, subjectId);
    }

    public List<Marks> findByStudentId(Long studentId) {
        String sql = "SELECT m.*, " +
                "CONCAT(s.first_name, ' ', s.last_name) AS student_name, s.student_id AS student_reg_id, " +
                "sub.subject_name, sub.subject_code, c.course_name, sub.semester " +
                "FROM marks m " +
                "JOIN students s ON m.student_id = s.id " +
                "JOIN subjects sub ON m.subject_id = sub.id " +
                "JOIN courses c ON sub.course_id = c.id " +
                "WHERE m.student_id = ? " +
                "ORDER BY sub.semester ASC, sub.subject_code ASC";
        return jdbcTemplate.query(sql, marksRowMapper, studentId);
    }

    public List<Map<String, Object>> getGradeDistribution() {
        return getGradeDistribution(null);
    }

    public List<Map<String, Object>> getGradeDistribution(Long departmentId) {
        if (departmentId == null) {
            String sql = "SELECT grade, COUNT(*) AS count FROM marks GROUP BY grade ORDER BY grade ASC";
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                Map<String, Object> map = new HashMap<>();
                map.put("grade", rs.getString("grade"));
                map.put("count", rs.getLong("count"));
                return map;
            });
        }

        String sql = "SELECT m.grade, COUNT(*) AS count FROM marks m " +
                "JOIN subjects sub ON m.subject_id = sub.id " +
                "JOIN courses c ON sub.course_id = c.id " +
                "WHERE c.department_id = ? " +
                "GROUP BY m.grade ORDER BY m.grade ASC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("grade", rs.getString("grade"));
            map.put("count", rs.getLong("count"));
            return map;
        }, departmentId);
    }
}
