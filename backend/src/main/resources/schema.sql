-- ==========================================================
-- Student Management System - Relational Database Schema
-- Compatible with MySQL 8.x and H2 (MODE=MySQL)
-- ==========================================================

-- Drop tables if they exist in reverse dependency order
DROP TABLE IF EXISTS marks;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS otp_verifications;
DROP TABLE IF EXISTS users;

-- ----------------------------------------------------------
-- 1. USERS TABLE (System Admins and Staff)
-- ----------------------------------------------------------
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'STAFF',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    student_id BIGINT NULL,
    department_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_department ON users(department_id);

-- ----------------------------------------------------------
-- 2. OTP VERIFICATIONS TABLE
-- ----------------------------------------------------------
CREATE TABLE otp_verifications (
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
);

-- ----------------------------------------------------------
-- 3. DEPARTMENTS TABLE
-- ----------------------------------------------------------
CREATE TABLE departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_departments_code ON departments(code);

-- ----------------------------------------------------------
-- 3. COURSES TABLE
-- ----------------------------------------------------------
CREATE TABLE courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(30) NOT NULL UNIQUE,
    course_name VARCHAR(120) NOT NULL,
    department_id BIGINT NOT NULL,
    duration_years INT NOT NULL DEFAULT 4,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_courses_department FOREIGN KEY (department_id) 
        REFERENCES departments(id) ON DELETE RESTRICT
);

CREATE INDEX idx_courses_dept ON courses(department_id);
CREATE INDEX idx_courses_code ON courses(course_code);

-- ----------------------------------------------------------
-- 4. SUBJECTS TABLE
-- ----------------------------------------------------------
CREATE TABLE subjects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(30) NOT NULL UNIQUE,
    subject_name VARCHAR(120) NOT NULL,
    course_id BIGINT NOT NULL,
    semester INT NOT NULL,
    credits INT NOT NULL DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subjects_course FOREIGN KEY (course_id) 
        REFERENCES courses(id) ON DELETE CASCADE
);

CREATE INDEX idx_subjects_course_sem ON subjects(course_id, semester);
CREATE INDEX idx_subjects_code ON subjects(subject_code);

-- ----------------------------------------------------------
-- 5. STUDENTS TABLE
-- ----------------------------------------------------------
CREATE TABLE students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(30) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(25) NOT NULL,
    address TEXT,
    department_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    academic_year INT NOT NULL,
    semester INT NOT NULL,
    admission_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    profile_image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_students_department FOREIGN KEY (department_id) 
        REFERENCES departments(id) ON DELETE RESTRICT,
    CONSTRAINT fk_students_course FOREIGN KEY (course_id) 
        REFERENCES courses(id) ON DELETE RESTRICT
);

CREATE INDEX idx_students_dept ON students(department_id);
CREATE INDEX idx_students_course ON students(course_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_year_sem ON students(academic_year, semester);
CREATE INDEX idx_students_name ON students(first_name, last_name);

-- ----------------------------------------------------------
-- 6. ATTENDANCE TABLE
-- ----------------------------------------------------------
CREATE TABLE attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'PRESENT' or 'ABSENT'
    remarks VARCHAR(255),
    recorded_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) 
        REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_subject FOREIGN KEY (subject_id) 
        REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_user FOREIGN KEY (recorded_by) 
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uk_attendance_rec UNIQUE (student_id, subject_id, attendance_date)
);

CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_subject_date ON attendance(subject_id, attendance_date);

-- ----------------------------------------------------------
-- 7. MARKS TABLE
-- ----------------------------------------------------------
CREATE TABLE marks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    internal_marks DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    assignment_marks DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    exam_marks DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    total_marks DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    grade VARCHAR(5) NOT NULL, -- 'A+', 'A', 'B+', 'B', 'C', 'F'
    recorded_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_marks_student FOREIGN KEY (student_id) 
        REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_marks_subject FOREIGN KEY (subject_id) 
        REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT fk_marks_user FOREIGN KEY (recorded_by) 
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uk_marks_student_subject UNIQUE (student_id, subject_id)
);

CREATE INDEX idx_marks_student ON marks(student_id);
CREATE INDEX idx_marks_subject ON marks(subject_id);
CREATE INDEX idx_marks_grade ON marks(grade);
