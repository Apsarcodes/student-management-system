package com.sms.dao;

import com.sms.model.Subject;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class SubjectDao {
    private final JdbcTemplate jdbcTemplate;

    public SubjectDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Subject> subjectRowMapper = (rs, rowNum) -> {
        Subject sub = new Subject();
        sub.setId(rs.getLong("id"));
        sub.setSubjectCode(rs.getString("subject_code"));
        sub.setSubjectName(rs.getString("subject_name"));
        sub.setCourseId(rs.getLong("course_id"));
        sub.setSemester(rs.getInt("semester"));
        sub.setCredits(rs.getInt("credits"));
        Timestamp ct = rs.getTimestamp("created_at");
        if (ct != null) sub.setCreatedAt(ct.toLocalDateTime());
        Timestamp ut = rs.getTimestamp("updated_at");
        if (ut != null) sub.setUpdatedAt(ut.toLocalDateTime());

        try {
            sub.setCourseName(rs.getString("course_name"));
            sub.setCourseCode(rs.getString("course_code"));
            sub.setDepartmentName(rs.getString("department_name"));
            long dId = rs.getLong("department_id");
            if (!rs.wasNull()) {
                sub.setDepartmentId(dId);
            }
        } catch (Exception ignored) {}

        return sub;
    };

    public List<Subject> findAll(Long courseId, Integer semester) {
        return findAll(courseId, semester, null);
    }

    public List<Subject> findAll(Long courseId, Integer semester, Long departmentId) {
        StringBuilder sql = new StringBuilder(
                "SELECT s.*, c.course_name, c.course_code, c.department_id, d.name AS department_name " +
                "FROM subjects s " +
                "JOIN courses c ON s.course_id = c.id " +
                "JOIN departments d ON c.department_id = d.id WHERE 1=1 "
        );

        List<Object> params = new ArrayList<>();
        if (departmentId != null) {
            sql.append("AND c.department_id = ? ");
            params.add(departmentId);
        }
        if (courseId != null) {
            sql.append("AND s.course_id = ? ");
            params.add(courseId);
        }
        if (semester != null) {
            sql.append("AND s.semester = ? ");
            params.add(semester);
        }
        sql.append("ORDER BY s.semester ASC, s.subject_name ASC");

        return jdbcTemplate.query(sql.toString(), subjectRowMapper, params.toArray());
    }

    public Optional<Subject> findById(Long id) {
        String sql = "SELECT s.*, c.course_name, c.course_code, c.department_id, d.name AS department_name " +
                "FROM subjects s " +
                "JOIN courses c ON s.course_id = c.id " +
                "JOIN departments d ON c.department_id = d.id " +
                "WHERE s.id = ?";
        try {
            Subject sub = jdbcTemplate.queryForObject(sql, subjectRowMapper, id);
            return Optional.ofNullable(sub);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<Subject> findByCode(String code) {
        String sql = "SELECT s.*, c.course_name, c.course_code, c.department_id, d.name AS department_name " +
                "FROM subjects s " +
                "JOIN courses c ON s.course_id = c.id " +
                "JOIN departments d ON c.department_id = d.id " +
                "WHERE LOWER(s.subject_code) = LOWER(?)";
        try {
            Subject sub = jdbcTemplate.queryForObject(sql, subjectRowMapper, code);
            return Optional.ofNullable(sub);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Subject save(Subject subject) {
        String sql = "INSERT INTO subjects (subject_code, subject_name, course_id, semester, credits, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        LocalDateTime now = LocalDateTime.now();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, subject.getSubjectCode().toUpperCase().trim());
            ps.setString(2, subject.getSubjectName().trim());
            ps.setLong(3, subject.getCourseId());
            ps.setInt(4, subject.getSemester());
            ps.setInt(5, subject.getCredits() != null ? subject.getCredits() : 3);
            ps.setTimestamp(6, Timestamp.valueOf(now));
            ps.setTimestamp(7, Timestamp.valueOf(now));
            return ps;
        }, keyHolder);

        if (keyHolder.getKeys() != null) {
            Object idVal = keyHolder.getKeys().get("id");
            if (idVal == null) idVal = keyHolder.getKeys().get("ID");
            if (idVal instanceof Number num) {
                subject.setId(num.longValue());
            }
        }
        if (subject.getId() == null && keyHolder.getKey() != null) {
            subject.setId(keyHolder.getKey().longValue());
        }
        subject.setCreatedAt(now);
        subject.setUpdatedAt(now);
        return subject;
    }

    public void update(Subject subject) {
        String sql = "UPDATE subjects SET subject_code = ?, subject_name = ?, course_id = ?, semester = ?, credits = ?, updated_at = ? WHERE id = ?";
        jdbcTemplate.update(sql,
                subject.getSubjectCode().toUpperCase().trim(),
                subject.getSubjectName().trim(),
                subject.getCourseId(),
                subject.getSemester(),
                subject.getCredits(),
                Timestamp.valueOf(LocalDateTime.now()),
                subject.getId());
    }

    public void deleteById(Long id) {
        String sql = "DELETE FROM subjects WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public boolean existsByCode(String code, Long excludeId) {
        String sql = excludeId == null ?
                "SELECT COUNT(*) FROM subjects WHERE LOWER(subject_code) = LOWER(?)" :
                "SELECT COUNT(*) FROM subjects WHERE LOWER(subject_code) = LOWER(?) AND id <> ?";
        Integer count = excludeId == null ?
                jdbcTemplate.queryForObject(sql, Integer.class, code.trim()) :
                jdbcTemplate.queryForObject(sql, Integer.class, code.trim(), excludeId);
        return count != null && count > 0;
    }
}
