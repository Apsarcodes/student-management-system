package com.sms.config;

import com.sms.dao.UserDao;
import com.sms.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DatabaseInitializer implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DatabaseInitializer.class);

    private final UserDao userDao;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Value("${app.seed.admin-password:#{null}}")
    private String adminPassword;

    @Value("${app.seed.faculty-password:#{null}}")
    private String facultyPassword;

    @Value("${app.seed.student-password:#{null}}")
    private String studentPassword;

    public DatabaseInitializer(UserDao userDao, PasswordEncoder passwordEncoder, JdbcTemplate jdbcTemplate) {
        this.userDao = userDao;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        ensureOtpVerificationTable();
        log.info("Checking and initializing system users credentials...");

        // Ensure Admin user exists with valid BCrypt hash
        Optional<User> adminOpt = userDao.findByUsernameOrEmail("admin");
        if (!adminOpt.isPresent()) {
            adminOpt = userDao.findByUsernameOrEmail("admin@university.edu");
        }
        if (adminOpt.isPresent()) {
            if (adminPassword != null) {
                userDao.updatePassword(adminOpt.get().getId(), passwordEncoder.encode(adminPassword));
                log.info("Admin password initialized successfully for " + adminOpt.get().getEmail());
            }
        } else {
            String pwd = adminPassword != null ? adminPassword : generateDefaultPassword();
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@university.edu");
            admin.setPasswordHash(passwordEncoder.encode(pwd));
            admin.setFullName("System Administrator");
            admin.setRole("ADMIN");
            admin.setStatus("ACTIVE");
            userDao.save(admin);
            log.info("Created new admin user: admin@university.edu (password set via ADMIN_SEED_PASSWORD env var or generated)");
        }

        // Ensure Faculty user exists with valid BCrypt hash
        Optional<User> facultyOpt = userDao.findByUsernameOrEmail("faculty");
        if (!facultyOpt.isPresent()) {
            facultyOpt = userDao.findByUsernameOrEmail("sakthipriyacsbs@gmail.com");
        }
        if (!facultyOpt.isPresent()) {
            facultyOpt = userDao.findByUsernameOrEmail("faculty@university.edu");
        }
        if (facultyOpt.isPresent()) {
            if (facultyPassword != null) {
                userDao.updatePassword(facultyOpt.get().getId(), passwordEncoder.encode(facultyPassword));
                log.info("Faculty password initialized successfully for " + facultyOpt.get().getEmail());
            }
        } else {
            String pwd = facultyPassword != null ? facultyPassword : generateDefaultPassword();
            User faculty = new User();
            faculty.setUsername("faculty");
            faculty.setEmail("sakthipriyacsbs@gmail.com");
            faculty.setPasswordHash(passwordEncoder.encode(pwd));
            faculty.setFullName("Dr. N Sakthipriya");
            faculty.setRole("STAFF");
            faculty.setStatus("ACTIVE");
            faculty.setDepartmentId(5L);
            userDao.save(faculty);
            log.info("Created new faculty user: sakthipriyacsbs@gmail.com (password set via FACULTY_SEED_PASSWORD env var or generated)");
        }

        // Ensure Student user exists with valid BCrypt hash
        Optional<User> studentOpt = userDao.findByUsernameOrEmail("student");
        if (!studentOpt.isPresent()) {
            studentOpt = userDao.findByUsernameOrEmail("student@university.edu");
        }
        if (studentOpt.isPresent()) {
            User existingStudent = studentOpt.get();
            if (studentPassword != null) {
                userDao.updatePassword(existingStudent.getId(), passwordEncoder.encode(studentPassword));
            }
            existingStudent.setFullName("Alexander Wright");
            existingStudent.setStudentId(1L);
            existingStudent.setDepartmentId(1L);
            userDao.update(existingStudent);
            log.info("Student account initialized successfully for " + existingStudent.getEmail());
        } else {
            String pwd = studentPassword != null ? studentPassword : generateDefaultPassword();
            User student = new User();
            student.setUsername("student");
            student.setEmail("student@university.edu");
            student.setPasswordHash(passwordEncoder.encode(pwd));
            student.setFullName("Alexander Wright");
            student.setRole("STUDENT");
            student.setStatus("ACTIVE");
            student.setStudentId(1L);
            student.setDepartmentId(1L);
            userDao.save(student);
            log.info("Created new student user: student@university.edu (password set via STUDENT_SEED_PASSWORD env var or generated)");
        }

        // Clean up legacy demo accounts
        Optional<User> old1 = userDao.findByUsernameOrEmail("prof.smith@university.edu");
        old1.ifPresent(u -> userDao.deleteById(u.getId()));
        Optional<User> old2 = userDao.findByUsernameOrEmail("prof.johnson@university.edu");
        old2.ifPresent(u -> userDao.deleteById(u.getId()));

        log.info("System credentials initialization completed for Admin, Faculty, and Student.");
    }

    private void ensureOtpVerificationTable() {
        String sql = """
            CREATE TABLE IF NOT EXISTS otp_verifications (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) NOT NULL,
                purpose VARCHAR(40) NOT NULL,
                otp_hash VARCHAR(255) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                attempts INT NOT NULL DEFAULT 0,
                last_sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                verified BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_otp_email_purpose (email, purpose),
                INDEX idx_otp_expires_at (expires_at)
            )
            """;

        jdbcTemplate.execute(sql);
        log.info("Ensured otp_verifications table exists.");
    }

    private String generateDefaultPassword() {
        // Generate a random password when no seed password is configured
        return java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 16) + "!A1";
    }
}
