package com.sms.dao;

import com.sms.model.Department;
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
import java.util.List;
import java.util.Optional;

@Repository
public class DepartmentDao {
    private final JdbcTemplate jdbcTemplate;

    public DepartmentDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Department> departmentRowMapper = (rs, rowNum) -> {
        Department dept = new Department();
        dept.setId(rs.getLong("id"));
        dept.setCode(rs.getString("code"));
        dept.setName(rs.getString("name"));
        dept.setDescription(rs.getString("description"));
        Timestamp ct = rs.getTimestamp("created_at");
        if (ct != null) dept.setCreatedAt(ct.toLocalDateTime());
        Timestamp ut = rs.getTimestamp("updated_at");
        if (ut != null) dept.setUpdatedAt(ut.toLocalDateTime());

        try {
            dept.setCourseCount(rs.getInt("course_count"));
        } catch (Exception ignored) {}
        try {
            dept.setStudentCount(rs.getInt("student_count"));
        } catch (Exception ignored) {}

        return dept;
    };

    public List<Department> findAll() {
        String sql = "SELECT d.*, " +
                "(SELECT COUNT(*) FROM courses c WHERE c.department_id = d.id) AS course_count, " +
                "(SELECT COUNT(*) FROM students s WHERE s.department_id = d.id) AS student_count " +
                "FROM departments d ORDER BY d.name ASC";
        return jdbcTemplate.query(sql, departmentRowMapper);
    }

    public Optional<Department> findById(Long id) {
        String sql = "SELECT d.*, " +
                "(SELECT COUNT(*) FROM courses c WHERE c.department_id = d.id) AS course_count, " +
                "(SELECT COUNT(*) FROM students s WHERE s.department_id = d.id) AS student_count " +
                "FROM departments d WHERE d.id = ?";
        try {
            Department dept = jdbcTemplate.queryForObject(sql, departmentRowMapper, id);
            return Optional.ofNullable(dept);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<Department> findByCode(String code) {
        String sql = "SELECT d.*, 0 AS course_count, 0 AS student_count FROM departments d WHERE LOWER(d.code) = LOWER(?)";
        try {
            Department dept = jdbcTemplate.queryForObject(sql, departmentRowMapper, code);
            return Optional.ofNullable(dept);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Department save(Department dept) {
        String sql = "INSERT INTO departments (code, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        LocalDateTime now = LocalDateTime.now();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, dept.getCode().toUpperCase().trim());
            ps.setString(2, dept.getName().trim());
            ps.setString(3, dept.getDescription());
            ps.setTimestamp(4, Timestamp.valueOf(now));
            ps.setTimestamp(5, Timestamp.valueOf(now));
            return ps;
        }, keyHolder);

        if (keyHolder.getKeys() != null) {
            Object idVal = keyHolder.getKeys().get("id");
            if (idVal == null) idVal = keyHolder.getKeys().get("ID");
            if (idVal instanceof Number num) {
                dept.setId(num.longValue());
            }
        }
        if (dept.getId() == null && keyHolder.getKey() != null) {
            dept.setId(keyHolder.getKey().longValue());
        }
        dept.setCreatedAt(now);
        dept.setUpdatedAt(now);
        dept.setCourseCount(0);
        dept.setStudentCount(0);
        return dept;
    }

    public void update(Department dept) {
        String sql = "UPDATE departments SET code = ?, name = ?, description = ?, updated_at = ? WHERE id = ?";
        jdbcTemplate.update(sql,
                dept.getCode().toUpperCase().trim(),
                dept.getName().trim(),
                dept.getDescription(),
                Timestamp.valueOf(LocalDateTime.now()),
                dept.getId());
    }

    public void deleteById(Long id) {
        String sql = "DELETE FROM departments WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public boolean existsByCode(String code, Long excludeId) {
        String sql = excludeId == null ?
                "SELECT COUNT(*) FROM departments WHERE LOWER(code) = LOWER(?)" :
                "SELECT COUNT(*) FROM departments WHERE LOWER(code) = LOWER(?) AND id <> ?";
        Integer count = excludeId == null ?
                jdbcTemplate.queryForObject(sql, Integer.class, code.trim()) :
                jdbcTemplate.queryForObject(sql, Integer.class, code.trim(), excludeId);
        return count != null && count > 0;
    }

    public int countCourses(Long departmentId) {
        String sql = "SELECT COUNT(*) FROM courses WHERE department_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, departmentId);
        return count != null ? count : 0;
    }

    public int countStudents(Long departmentId) {
        String sql = "SELECT COUNT(*) FROM students WHERE department_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, departmentId);
        return count != null ? count : 0;
    }
}
