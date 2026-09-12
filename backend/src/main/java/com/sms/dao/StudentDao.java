package com.sms.dao;

import com.sms.model.Student;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class StudentDao {
    private final JdbcTemplate jdbcTemplate;

    public StudentDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Student> studentRowMapper = (rs, rowNum) -> {
        Student s = new Student();
        s.setId(rs.getLong("id"));
        s.setStudentId(rs.getString("student_id"));
        s.setFirstName(rs.getString("first_name"));
        s.setLastName(rs.getString("last_name"));
        Date dob = rs.getDate("date_of_birth");
        if (dob != null) s.setDateOfBirth(dob.toLocalDate());
        s.setGender(rs.getString("gender"));
        s.setEmail(rs.getString("email"));
        s.setPhone(rs.getString("phone"));
        s.setAddress(rs.getString("address"));
        s.setDepartmentId(rs.getLong("department_id"));
        s.setCourseId(rs.getLong("course_id"));
        s.setAcademicYear(rs.getInt("academic_year"));
        s.setSemester(rs.getInt("semester"));
        Date adm = rs.getDate("admission_date");
        if (adm != null) s.setAdmissionDate(adm.toLocalDate());
        s.setStatus(rs.getString("status"));
        s.setProfileImageUrl(rs.getString("profile_image_url"));
        Timestamp ct = rs.getTimestamp("created_at");
        if (ct != null) s.setCreatedAt(ct.toLocalDateTime());
        Timestamp ut = rs.getTimestamp("updated_at");
        if (ut != null) s.setUpdatedAt(ut.toLocalDateTime());

        try {
            s.setDepartmentName(rs.getString("department_name"));
            s.setDepartmentCode(rs.getString("department_code"));
        } catch (Exception ignored) {}

        try {
            s.setCourseName(rs.getString("course_name"));
            s.setCourseCode(rs.getString("course_code"));
        } catch (Exception ignored) {}

        try {
            double att = rs.getDouble("attendance_pct");
            if (!rs.wasNull()) s.setAttendancePercentage(att);
        } catch (Exception ignored) {}

        try {
            double avg = rs.getDouble("avg_marks");
            if (!rs.wasNull()) s.setAverageMarks(avg);
        } catch (Exception ignored) {}

        return s;
    };

    public List<Student> searchStudents(
            String search,
            Long departmentId,
            Long courseId,
            Integer academicYear,
            Integer semester,
            String status,
            String sortBy,
            String sortDirection,
            int offset,
            int limit
    ) {
        StringBuilder sql = new StringBuilder(
                "SELECT s.*, d.name AS department_name, d.code AS department_code, " +
                "c.course_name, c.course_code, " +
                "(SELECT ROUND(COALESCE(SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 0), 1) " +
                " FROM attendance a WHERE a.student_id = s.id) AS attendance_pct, " +
                "(SELECT ROUND(COALESCE(AVG(m.percentage), 0), 1) FROM marks m WHERE m.student_id = s.id) AS avg_marks " +
                "FROM students s " +
                "JOIN departments d ON s.department_id = d.id " +
                "JOIN courses c ON s.course_id = c.id " +
                "WHERE 1=1 "
        );

        List<Object> params = new ArrayList<>();
        appendFilters(sql, params, search, departmentId, courseId, academicYear, semester, status);

        // Sorting
        String validSortCol = switch (sortBy != null ? sortBy.toLowerCase() : "id") {
            case "studentid", "student_id" -> "s.student_id";
            case "name", "firstname" -> "s.first_name";
            case "department" -> "d.name";
            case "course" -> "c.course_name";
            case "admissiondate", "admission_date" -> "s.admission_date";
            case "status" -> "s.status";
            case "attendance", "attendance_pct" -> "attendance_pct";
            default -> "s.id";
        };
        String validDir = "ASC".equalsIgnoreCase(sortDirection) ? "ASC" : "DESC";
        sql.append(" ORDER BY ").append(validSortCol).append(" ").append(validDir);

        // Pagination
        sql.append(" LIMIT ? OFFSET ?");
        params.add(limit);
        params.add(offset);

        return jdbcTemplate.query(sql.toString(), studentRowMapper, params.toArray());
    }

    public long countStudents(
            String search,
            Long departmentId,
            Long courseId,
            Integer academicYear,
            Integer semester,
            String status
    ) {
        StringBuilder sql = new StringBuilder(
                "SELECT COUNT(*) FROM students s " +
                "JOIN departments d ON s.department_id = d.id " +
                "JOIN courses c ON s.course_id = c.id " +
                "WHERE 1=1 "
        );
        List<Object> params = new ArrayList<>();
        appendFilters(sql, params, search, departmentId, courseId, academicYear, semester, status);

        Long count = jdbcTemplate.queryForObject(sql.toString(), Long.class, params.toArray());
        return count != null ? count : 0;
    }

    private void appendFilters(
            StringBuilder sql,
            List<Object> params,
            String search,
            Long departmentId,
            Long courseId,
            Integer academicYear,
            Integer semester,
            String status
    ) {
        if (StringUtils.hasText(search)) {
            String term = "%" + search.trim().toLowerCase() + "%";
            sql.append("AND (LOWER(s.first_name) LIKE ? OR LOWER(s.last_name) LIKE ? OR LOWER(CONCAT(s.first_name, ' ', s.last_name)) LIKE ? OR LOWER(s.student_id) LIKE ? OR LOWER(s.email) LIKE ?) ");
            params.add(term);
            params.add(term);
            params.add(term);
            params.add(term);
            params.add(term);
        }
        if (departmentId != null) {
            sql.append("AND s.department_id = ? ");
            params.add(departmentId);
        }
        if (courseId != null) {
            sql.append("AND s.course_id = ? ");
            params.add(courseId);
        }
        if (academicYear != null) {
            sql.append("AND s.academic_year = ? ");
            params.add(academicYear);
        }
        if (semester != null) {
            sql.append("AND s.semester = ? ");
            params.add(semester);
        }
        if (StringUtils.hasText(status) && !"All".equalsIgnoreCase(status)) {
            sql.append("AND s.status = ? ");
            params.add(status);
        }
    }

    public Optional<Student> findById(Long id) {
        String sql = "SELECT s.*, d.name AS department_name, d.code AS department_code, " +
                "c.course_name, c.course_code, " +
                "(SELECT ROUND(COALESCE(SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 0), 1) " +
                " FROM attendance a WHERE a.student_id = s.id) AS attendance_pct, " +
                "(SELECT ROUND(COALESCE(AVG(m.percentage), 0), 1) FROM marks m WHERE m.student_id = s.id) AS avg_marks " +
                "FROM students s " +
                "JOIN departments d ON s.department_id = d.id " +
                "JOIN courses c ON s.course_id = c.id " +
                "WHERE s.id = ?";
        try {
            Student student = jdbcTemplate.queryForObject(sql, studentRowMapper, id);
            return Optional.ofNullable(student);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<Student> findByClass(Long courseId, Integer semester) {
        String sql = "SELECT s.*, d.name AS department_name, d.code AS department_code, " +
                "c.course_name, c.course_code, 0 AS attendance_pct, 0 AS avg_marks " +
                "FROM students s " +
                "JOIN departments d ON s.department_id = d.id " +
                "JOIN courses c ON s.course_id = c.id " +
                "WHERE s.course_id = ? AND s.semester = ? AND s.status = 'Active' " +
                "ORDER BY s.student_id ASC";
        return jdbcTemplate.query(sql, studentRowMapper, courseId, semester);
    }

    public Student save(Student s) {
        String sql = "INSERT INTO students (student_id, first_name, last_name, date_of_birth, gender, email, phone, " +
                "address, department_id, course_id, academic_year, semester, admission_date, status, profile_image_url, " +
                "created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();
        LocalDateTime now = LocalDateTime.now();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, s.getStudentId().toUpperCase().trim());
            ps.setString(2, s.getFirstName().trim());
            ps.setString(3, s.getLastName().trim());
            ps.setDate(4, Date.valueOf(s.getDateOfBirth()));
            ps.setString(5, s.getGender());
            ps.setString(6, s.getEmail().trim());
            ps.setString(7, s.getPhone().trim());
            ps.setString(8, s.getAddress());
            ps.setLong(9, s.getDepartmentId());
            ps.setLong(10, s.getCourseId());
            ps.setInt(11, s.getAcademicYear());
            ps.setInt(12, s.getSemester());
            ps.setDate(13, Date.valueOf(s.getAdmissionDate()));
            ps.setString(14, s.getStatus() != null ? s.getStatus() : "Active");
            ps.setString(15, s.getProfileImageUrl());
            ps.setTimestamp(16, Timestamp.valueOf(now));
            ps.setTimestamp(17, Timestamp.valueOf(now));
            return ps;
        }, keyHolder);

        if (keyHolder.getKeys() != null) {
            Object idVal = keyHolder.getKeys().get("id");
            if (idVal == null) idVal = keyHolder.getKeys().get("ID");
            if (idVal instanceof Number num) {
                s.setId(num.longValue());
            }
        }
        if (s.getId() == null && keyHolder.getKey() != null) {
            s.setId(keyHolder.getKey().longValue());
        }
        s.setCreatedAt(now);
        s.setUpdatedAt(now);
        return s;
    }

    public void update(Student s) {
        String sql = "UPDATE students SET student_id = ?, first_name = ?, last_name = ?, date_of_birth = ?, " +
                "gender = ?, email = ?, phone = ?, address = ?, department_id = ?, course_id = ?, " +
                "academic_year = ?, semester = ?, admission_date = ?, status = ?, profile_image_url = ?, " +
                "updated_at = ? WHERE id = ?";

        jdbcTemplate.update(sql,
                s.getStudentId().toUpperCase().trim(),
                s.getFirstName().trim(),
                s.getLastName().trim(),
                Date.valueOf(s.getDateOfBirth()),
                s.getGender(),
                s.getEmail().trim(),
                s.getPhone().trim(),
                s.getAddress(),
                s.getDepartmentId(),
                s.getCourseId(),
                s.getAcademicYear(),
                s.getSemester(),
                Date.valueOf(s.getAdmissionDate()),
                s.getStatus(),
                s.getProfileImageUrl(),
                Timestamp.valueOf(LocalDateTime.now()),
                s.getId());
    }

    public void deleteById(Long id) {
        String sql = "DELETE FROM students WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public void updateContactInfo(Long id, String phone, String address) {
        String sql = "UPDATE students SET phone = ?, address = ?, updated_at = ? WHERE id = ?";
        jdbcTemplate.update(sql, phone != null ? phone.trim() : null, address != null ? address.trim() : null, Timestamp.valueOf(LocalDateTime.now()), id);
    }

    public boolean existsByStudentId(String studentId, Long excludeId) {
        String sql = excludeId == null ?
                "SELECT COUNT(*) FROM students WHERE LOWER(student_id) = LOWER(?)" :
                "SELECT COUNT(*) FROM students WHERE LOWER(student_id) = LOWER(?) AND id <> ?";
        Integer count = excludeId == null ?
                jdbcTemplate.queryForObject(sql, Integer.class, studentId.trim()) :
                jdbcTemplate.queryForObject(sql, Integer.class, studentId.trim(), excludeId);
        return count != null && count > 0;
    }

    public boolean existsByEmail(String email, Long excludeId) {
        String sql = excludeId == null ?
                "SELECT COUNT(*) FROM students WHERE LOWER(email) = LOWER(?)" :
                "SELECT COUNT(*) FROM students WHERE LOWER(email) = LOWER(?) AND id <> ?";
        Integer count = excludeId == null ?
                jdbcTemplate.queryForObject(sql, Integer.class, email.trim()) :
                jdbcTemplate.queryForObject(sql, Integer.class, email.trim(), excludeId);
        return count != null && count > 0;
    }

    public List<Student> findUnlinkedStudents(Long departmentId) {
        StringBuilder sql = new StringBuilder(
                "SELECT s.*, d.name AS department_name, d.code AS department_code, " +
                "c.course_name, c.course_code " +
                "FROM students s " +
                "JOIN departments d ON s.department_id = d.id " +
                "JOIN courses c ON s.course_id = c.id " +
                "WHERE s.id NOT IN (SELECT student_id FROM users WHERE student_id IS NOT NULL) "
        );
        List<Object> params = new ArrayList<>();
        if (departmentId != null) {
            sql.append("AND s.department_id = ? ");
            params.add(departmentId);
        }
        sql.append("ORDER BY s.student_id ASC");
        return jdbcTemplate.query(sql.toString(), studentRowMapper, params.toArray());
    }
}
