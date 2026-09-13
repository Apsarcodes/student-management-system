package com.sms.dao;

import com.sms.model.User;
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
public class UserDao {
    private final JdbcTemplate jdbcTemplate;

    public UserDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<User> userRowMapper = (rs, rowNum) -> {
        User user = new User();
        user.setId(rs.getLong("id"));
        user.setUsername(rs.getString("username"));
        user.setEmail(rs.getString("email"));
        user.setPasswordHash(rs.getString("password_hash"));
        user.setFullName(rs.getString("full_name"));
        user.setRole(rs.getString("role"));
        user.setStatus(rs.getString("status"));
        try {
            long sid = rs.getLong("student_id");
            if (!rs.wasNull()) {
                user.setStudentId(sid);
            }
        } catch (Exception ignored) {}
        try {
            long did = rs.getLong("department_id");
            if (!rs.wasNull()) {
                user.setDepartmentId(did);
            }
        } catch (Exception ignored) {}
        try {
            user.setDepartmentName(rs.getString("department_name"));
            user.setDepartmentCode(rs.getString("department_code"));
        } catch (Exception ignored) {}
        Timestamp ct = rs.getTimestamp("created_at");
        if (ct != null) user.setCreatedAt(ct.toLocalDateTime());
        Timestamp ut = rs.getTimestamp("updated_at");
        if (ut != null) user.setUpdatedAt(ut.toLocalDateTime());
        return user;
    };

    private static final String BASE_SELECT = 
            "SELECT u.*, d.name AS department_name, d.code AS department_code " +
            "FROM users u " +
            "LEFT JOIN departments d ON u.department_id = d.id ";

    public Optional<User> findById(Long id) {
        String sql = BASE_SELECT + "WHERE u.id = ?";
        try {
            User user = jdbcTemplate.queryForObject(sql, userRowMapper, id);
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<User> findByEmail(String email) {
        String sql = BASE_SELECT + "WHERE LOWER(u.email) = LOWER(?)";
        try {
            User user = jdbcTemplate.queryForObject(sql, userRowMapper, email);
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<User> findByUsername(String username) {
        String sql = BASE_SELECT + "WHERE LOWER(u.username) = LOWER(?)";
        try {
            User user = jdbcTemplate.queryForObject(sql, userRowMapper, username);
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<User> findByUsernameOrEmail(String identifier) {
        String sql = BASE_SELECT + "WHERE LOWER(u.username) = LOWER(?) OR LOWER(u.email) = LOWER(?)";
        try {
            User user = jdbcTemplate.queryForObject(sql, userRowMapper, identifier, identifier);
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<User> findAll() {
        String sql = BASE_SELECT + "ORDER BY u.id ASC";
        return jdbcTemplate.query(sql, userRowMapper);
    }

    public User save(User user) {
        String sql = "INSERT INTO users (username, email, password_hash, full_name, role, status, student_id, department_id, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        LocalDateTime now = LocalDateTime.now();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, user.getUsername());
            ps.setString(2, user.getEmail());
            ps.setString(3, user.getPasswordHash());
            ps.setString(4, user.getFullName());
            ps.setString(5, user.getRole());
            ps.setString(6, user.getStatus() != null ? user.getStatus() : "ACTIVE");
            if (user.getStudentId() != null) {
                ps.setLong(7, user.getStudentId());
            } else {
                ps.setNull(7, java.sql.Types.BIGINT);
            }
            if (user.getDepartmentId() != null) {
                ps.setLong(8, user.getDepartmentId());
            } else {
                ps.setNull(8, java.sql.Types.BIGINT);
            }
            ps.setTimestamp(9, Timestamp.valueOf(now));
            ps.setTimestamp(10, Timestamp.valueOf(now));
            return ps;
        }, keyHolder);

        if (keyHolder.getKeys() != null) {
            Object idVal = keyHolder.getKeys().get("id");
            if (idVal == null) idVal = keyHolder.getKeys().get("ID");
            if (idVal instanceof Number num) {
                user.setId(num.longValue());
            }
        }
        if (user.getId() == null && keyHolder.getKey() != null) {
            user.setId(keyHolder.getKey().longValue());
        }
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        return user;
    }

    public void update(User user) {
        String sql = "UPDATE users SET username = ?, email = ?, full_name = ?, role = ?, status = ?, student_id = ?, department_id = ?, updated_at = ? WHERE id = ?";
        jdbcTemplate.update(sql,
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getStatus(),
                user.getStudentId(),
                user.getDepartmentId(),
                Timestamp.valueOf(LocalDateTime.now()),
                user.getId());
    }

    public void activateUser(Long userId) {
        String sql = "UPDATE users SET status = 'ACTIVE', updated_at = ? WHERE id = ?";
        jdbcTemplate.update(sql, Timestamp.valueOf(LocalDateTime.now()), userId);
    }

    public void updatePassword(Long userId, String passwordHash) {
        String sql = "UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?";
        jdbcTemplate.update(sql, passwordHash, Timestamp.valueOf(LocalDateTime.now()), userId);
    }

    public void deleteById(Long id) {
        String sql = "DELETE FROM users WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public boolean existsByEmail(String email, Long excludeId) {
        String sql = excludeId == null ?
                "SELECT COUNT(*) FROM users WHERE LOWER(email) = LOWER(?)" :
                "SELECT COUNT(*) FROM users WHERE LOWER(email) = LOWER(?) AND id <> ?";
        Integer count = excludeId == null ?
                jdbcTemplate.queryForObject(sql, Integer.class, email) :
                jdbcTemplate.queryForObject(sql, Integer.class, email, excludeId);
        return count != null && count > 0;
    }

    public boolean existsByUsername(String username, Long excludeId) {
        String sql = excludeId == null ?
                "SELECT COUNT(*) FROM users WHERE LOWER(username) = LOWER(?)" :
                "SELECT COUNT(*) FROM users WHERE LOWER(username) = LOWER(?) AND id <> ?";
        Integer count = excludeId == null ?
                jdbcTemplate.queryForObject(sql, Integer.class, username) :
                jdbcTemplate.queryForObject(sql, Integer.class, username, excludeId);
        return count != null && count > 0;
    }

    public List<User> findPendingStudentUsers() {
        String sql = BASE_SELECT + "WHERE u.status = 'PENDING' AND u.role IN ('STUDENT', 'STAFF') ORDER BY u.created_at DESC";
        return jdbcTemplate.query(sql, userRowMapper);
    }

    public void linkStudentToUser(Long userId, Long studentId, Long departmentId) {
        String sql = "UPDATE users SET student_id = ?, department_id = COALESCE(?, department_id), status = 'ACTIVE', updated_at = ? WHERE id = ?";
        jdbcTemplate.update(sql, studentId, departmentId, Timestamp.valueOf(LocalDateTime.now()), userId);
    }
}
