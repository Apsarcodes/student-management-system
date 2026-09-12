package com.sms.dao;

import com.sms.model.Course;
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
public class CourseDao {
    private final JdbcTemplate jdbcTemplate;

    public CourseDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Course> courseRowMapper = (rs, rowNum) -> {
        Course course = new Course();
        course.setId(rs.getLong("id"));
        course.setCourseCode(rs.getString("course_code"));
        course.setCourseName(rs.getString("course_name"));
        course.setDepartmentId(rs.getLong("department_id"));
        course.setDurationYears(rs.getInt("duration_years"));
        course.setDescription(rs.getString("description"));
        Timestamp ct = rs.getTimestamp("created_at");
        if (ct != null) course.setCreatedAt(ct.toLocalDateTime());
        Timestamp ut = rs.getTimestamp("updated_at");
        if (ut != null) course.setUpdatedAt(ut.toLocalDateTime());

        try {
            course.setDepartmentName(rs.getString("department_name"));
            course.setDepartmentCode(rs.getString("department_code"));
        } catch (Exception ignored) {}

        try {
            course.setStudentCount(rs.getInt("student_count"));
        } catch (Exception ignored) {}

        try {
            course.setSubjectCount(rs.getInt("subject_count"));
        } catch (Exception ignored) {}

        return course;
    };

    public List<Course> findAll(Long departmentId) {
        StringBuilder sql = new StringBuilder(
                "SELECT c.*, d.name AS department_name, d.code AS department_code, " +
                "(SELECT COUNT(*) FROM students s WHERE s.course_id = c.id) AS student_count, " +
                "(SELECT COUNT(*) FROM subjects sub WHERE sub.course_id = c.id) AS subject_count " +
                "FROM courses c " +
                "JOIN departments d ON c.department_id = d.id "
        );

        List<Object> params = new ArrayList<>();
        if (departmentId != null) {
            sql.append("WHERE c.department_id = ? ");
            params.add(departmentId);
        }
        sql.append("ORDER BY c.course_name ASC");

        return jdbcTemplate.query(sql.toString(), courseRowMapper, params.toArray());
    }

    public Optional<Course> findById(Long id) {
        String sql = "SELECT c.*, d.name AS department_name, d.code AS department_code, " +
                "(SELECT COUNT(*) FROM students s WHERE s.course_id = c.id) AS student_count, " +
                "(SELECT COUNT(*) FROM subjects sub WHERE sub.course_id = c.id) AS subject_count " +
                "FROM courses c " +
                "JOIN departments d ON c.department_id = d.id " +
                "WHERE c.id = ?";
        try {
            Course course = jdbcTemplate.queryForObject(sql, courseRowMapper, id);
            return Optional.ofNullable(course);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<Course> findByCode(String courseCode) {
        String sql = "SELECT c.*, d.name AS department_name, d.code AS department_code, 0 AS student_count, 0 AS subject_count " +
                "FROM courses c " +
                "JOIN departments d ON c.department_id = d.id " +
                "WHERE LOWER(c.course_code) = LOWER(?)";
        try {
            Course course = jdbcTemplate.queryForObject(sql, courseRowMapper, courseCode);
            return Optional.ofNullable(course);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Course save(Course course) {
        String sql = "INSERT INTO courses (course_code, course_name, department_id, duration_years, description, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        LocalDateTime now = LocalDateTime.now();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, course.getCourseCode().toUpperCase().trim());
            ps.setString(2, course.getCourseName().trim());
            ps.setLong(3, course.getDepartmentId());
            ps.setInt(4, course.getDurationYears() != null ? course.getDurationYears() : 4);
            ps.setString(5, course.getDescription());
            ps.setTimestamp(6, Timestamp.valueOf(now));
            ps.setTimestamp(7, Timestamp.valueOf(now));
            return ps;
        }, keyHolder);

        if (keyHolder.getKeys() != null) {
            Object idVal = keyHolder.getKeys().get("id");
            if (idVal == null) idVal = keyHolder.getKeys().get("ID");
            if (idVal instanceof Number num) {
                course.setId(num.longValue());
            }
        }
        if (course.getId() == null && keyHolder.getKey() != null) {
            course.setId(keyHolder.getKey().longValue());
        }
        course.setCreatedAt(now);
        course.setUpdatedAt(now);
        return course;
    }

    public void update(Course course) {
        String sql = "UPDATE courses SET course_code = ?, course_name = ?, department_id = ?, duration_years = ?, description = ?, updated_at = ? WHERE id = ?";
        jdbcTemplate.update(sql,
                course.getCourseCode().toUpperCase().trim(),
                course.getCourseName().trim(),
                course.getDepartmentId(),
                course.getDurationYears(),
                course.getDescription(),
                Timestamp.valueOf(LocalDateTime.now()),
                course.getId());
    }

    public void deleteById(Long id) {
        String sql = "DELETE FROM courses WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public boolean existsByCode(String code, Long excludeId) {
        String sql = excludeId == null ?
                "SELECT COUNT(*) FROM courses WHERE LOWER(course_code) = LOWER(?)" :
                "SELECT COUNT(*) FROM courses WHERE LOWER(course_code) = LOWER(?) AND id <> ?";
        Integer count = excludeId == null ?
                jdbcTemplate.queryForObject(sql, Integer.class, code.trim()) :
                jdbcTemplate.queryForObject(sql, Integer.class, code.trim(), excludeId);
        return count != null && count > 0;
    }

    public int countStudents(Long courseId) {
        String sql = "SELECT COUNT(*) FROM students WHERE course_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, courseId);
        return count != null ? count : 0;
    }

    public int countSubjects(Long courseId) {
        String sql = "SELECT COUNT(*) FROM subjects WHERE course_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, courseId);
        return count != null ? count : 0;
    }
}
