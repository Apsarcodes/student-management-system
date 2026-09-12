-- ==========================================================
-- Student Management System - Seed Data
-- ==========================================================

-- ----------------------------------------------------------
-- 1. USERS (Admin & Staff)
-- Passwords are set at runtime by DatabaseInitializer via environment variables:
-- ADMIN_SEED_PASSWORD, FACULTY_SEED_PASSWORD, STUDENT_SEED_PASSWORD
-- (Spring Boot DatabaseInitializer verifies/refreshes BCrypt hashes on startup)
-- ----------------------------------------------------------
INSERT INTO users (id, username, email, password_hash, full_name, role, status, student_id, created_at, updated_at) VALUES
(1, 'admin', 'admin@university.edu', '$2a$10$wK1.V6dG9kK1QxZ8jJ9q1.8Q5tF8pGZ8jJ9q1.8Q5tF8pGZ8jJ9q1', 'System Administrator', 'ADMIN', 'ACTIVE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'faculty', 'faculty@university.edu', '$2a$10$wK1.V6dG9kK1QxZ8jJ9q1.8Q5tF8pGZ8jJ9q1.8Q5tF8pGZ8jJ9q1', 'Faculty Professor', 'STAFF', 'ACTIVE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'student', 'student@university.edu', '$2a$10$wK1.V6dG9kK1QxZ8jJ9q1.8Q5tF8pGZ8jJ9q1.8Q5tF8pGZ8jJ9q1', 'Student User', 'STUDENT', 'ACTIVE', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ----------------------------------------------------------
-- 2. DEPARTMENTS
-- ----------------------------------------------------------
INSERT INTO departments (id, code, name, description, created_at, updated_at) VALUES
(1, 'CSE', 'Computer Science & Engineering', 'Focuses on computing systems, software engineering, algorithms, and artificial intelligence.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'ECE', 'Electronics & Communication', 'Covers electronic circuits, communications, signal processing, and embedded systems.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'MECH', 'Mechanical Engineering', 'Specializes in mechanics, thermodynamics, fluid dynamics, and manufacturing engineering.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'MBA', 'Business Administration', 'Focuses on leadership, organizational management, finance, marketing, and strategy.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'CSBS', 'Computer Science and Business Systems', 'Interdisciplinary engineering covering computer algorithms, data science, and business management systems.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ----------------------------------------------------------
-- 3. COURSES
-- ----------------------------------------------------------
INSERT INTO courses (id, course_code, course_name, department_id, duration_years, description, created_at, updated_at) VALUES
(1, 'BTECH-CSE', 'Bachelor of Technology in Computer Science', 1, 4, 'Four-year undergraduate program in Computer Science & Engineering.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'BTECH-AI', 'Bachelor of Technology in AI & Data Science', 1, 4, 'Undergraduate program specializing in AI, Machine Learning, and Big Data.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'BTECH-ECE', 'Bachelor of Technology in Electronics & Communication', 2, 4, 'Undergraduate engineering in hardware systems, communication networks, and VLSI.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'BTECH-ME', 'Bachelor of Technology in Mechanical Engineering', 3, 4, 'Undergraduate degree encompassing design, manufacturing, and thermal sciences.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'MBA-MGMT', 'Master of Business Administration', 4, 2, 'Postgraduate degree preparing professionals for corporate leadership and management.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'MCA', 'Master of Computer Applications', 1, 2, 'Postgraduate program covering advanced software engineering and cloud computing.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 'BTECH-CSBS', 'Bachelor of Technology in Computer Science and Business Systems', 5, 4, 'Four-year undergraduate degree combining core computer engineering with business intelligence and enterprise systems.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ----------------------------------------------------------
-- 4. SUBJECTS
-- ----------------------------------------------------------
INSERT INTO subjects (id, subject_code, subject_name, course_id, semester, credits, created_at, updated_at) VALUES
-- BTECH-CSE
(1, 'CS101', 'Introduction to Programming & Problem Solving', 1, 1, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'MA101', 'Engineering Mathematics I', 1, 1, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'CS102', 'Data Structures & Algorithms', 1, 2, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'CS103', 'Object Oriented Programming with Java', 1, 2, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'CS201', 'Database Management Systems', 1, 3, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'CS202', 'Operating Systems Principles', 1, 3, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 'CS203', 'Computer Networks', 1, 4, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 'CS204', 'Software Engineering & Agile Methodologies', 1, 4, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- BTECH-AI
(9, 'AI201', 'Foundations of Machine Learning', 2, 3, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 'AI202', 'Probability, Statistics & Linear Algebra', 2, 3, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- BTECH-ECE
(11, 'EC101', 'Basic Electronics & Semiconductor Devices', 3, 1, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(12, 'EC102', 'Digital Logic & Circuit Design', 3, 2, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(13, 'EC201', 'Signals, Systems & Transforms', 3, 3, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- BTECH-ME
(14, 'ME101', 'Engineering Mechanics & Statics', 4, 1, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(15, 'ME102', 'Thermodynamics & Heat Transfer', 4, 2, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- MBA
(16, 'BA101', 'Financial Accounting & Reporting', 5, 1, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(17, 'BA102', 'Organizational Behavior & Human Resources', 5, 1, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- BTECH-CSBS
(18, 'CSBS101', 'Fundamentals of Computing & Business Systems', 7, 1, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(19, 'CSBS102', 'Financial Accounting & Business Strategy', 7, 1, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ----------------------------------------------------------
-- 5. STUDENTS (28 Students with realistic profiles)
-- ----------------------------------------------------------
INSERT INTO students (id, student_id, first_name, last_name, date_of_birth, gender, email, phone, address, department_id, course_id, academic_year, semester, admission_date, status, profile_image_url, created_at, updated_at) VALUES
(1, 'STU-2023-001', 'Alexander', 'Wright', '2004-03-15', 'Male', 'alexander.wright@student.edu', '+1-555-0101', '124 Maple Street, Seattle, WA', 1, 1, 2, 3, '2023-08-15', 'Active', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'STU-2023-002', 'Sophia', 'Chen', '2004-07-22', 'Female', 'sophia.chen@student.edu', '+1-555-0102', '782 Pine Avenue, San Jose, CA', 1, 1, 2, 3, '2023-08-15', 'Active', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'STU-2023-003', 'Liam', 'Miller', '2003-11-05', 'Male', 'liam.miller@student.edu', '+1-555-0103', '45 Elm Boulevard, Boston, MA', 1, 1, 2, 3, '2023-08-15', 'Active', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'STU-2023-004', 'Olivia', 'Davis', '2004-01-30', 'Female', 'olivia.davis@student.edu', '+1-555-0104', '903 Cedar Lane, Austin, TX', 1, 1, 2, 3, '2023-08-15', 'Active', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'STU-2023-005', 'Ethan', 'Taylor', '2004-05-18', 'Male', 'ethan.taylor@student.edu', '+1-555-0105', '318 Birch Road, Chicago, IL', 1, 1, 2, 3, '2023-08-15', 'Active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'STU-2023-006', 'Ava', 'Wilson', '2004-09-12', 'Female', 'ava.wilson@student.edu', '+1-555-0106', '554 Walnut Court, Denver, CO', 1, 2, 2, 3, '2023-08-15', 'Active', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 'STU-2023-007', 'Noah', 'Anderson', '2003-12-08', 'Male', 'noah.anderson@student.edu', '+1-555-0107', '621 Spruce Way, Atlanta, GA', 1, 2, 2, 3, '2023-08-15', 'Active', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 'STU-2023-008', 'Emma', 'Thomas', '2004-04-25', 'Female', 'emma.thomas@student.edu', '+1-555-0108', '190 Oak Drive, Portland, OR', 1, 2, 2, 3, '2023-08-15', 'Active', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 'STU-2022-009', 'James', 'Martinez', '2003-02-14', 'Male', 'james.martinez@student.edu', '+1-555-0109', '77 Willow Way, Phoenix, AZ', 2, 3, 3, 5, '2022-08-20', 'Active', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 'STU-2022-010', 'Mia', 'Robinson', '2003-06-19', 'Female', 'mia.robinson@student.edu', '+1-555-0110', '412 Magnolia Terrace, Miami, FL', 2, 3, 3, 5, '2022-08-20', 'Active', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(11, 'STU-2022-011', 'Benjamin', 'Clark', '2003-08-30', 'Male', 'benjamin.clark@student.edu', '+1-555-0111', '801 Ash Street, Dallas, TX', 2, 3, 3, 5, '2022-08-20', 'Active', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(12, 'STU-2022-012', 'Charlotte', 'Rodriguez', '2003-10-14', 'Female', 'charlotte.rodriguez@student.edu', '+1-555-0112', '335 Cypress Place, San Diego, CA', 3, 4, 3, 5, '2022-08-20', 'Active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(13, 'STU-2022-013', 'Lucas', 'Lewis', '2002-12-21', 'Male', 'lucas.lewis@student.edu', '+1-555-0113', '960 Redwood Circle, Minneapolis, MN', 3, 4, 3, 5, '2022-08-20', 'Active', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(14, 'STU-2024-014', 'Amelia', 'Lee', '2005-02-17', 'Female', 'amelia.lee@student.edu', '+1-555-0114', '144 Poplar Grove, Raleigh, NC', 1, 1, 1, 1, '2024-08-10', 'Active', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(15, 'STU-2024-015', 'Henry', 'Walker', '2005-04-09', 'Male', 'henry.walker@student.edu', '+1-555-0115', '288 Sycamore Path, Nashville, TN', 1, 1, 1, 1, '2024-08-10', 'Active', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(16, 'STU-2024-016', 'Harper', 'Hall', '2005-09-03', 'Female', 'harper.hall@student.edu', '+1-555-0116', '512 Hickory Drive, Columbus, OH', 1, 1, 1, 1, '2024-08-10', 'Active', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(17, 'STU-2024-017', 'Mason', 'Allen', '2005-06-27', 'Male', 'mason.allen@student.edu', '+1-555-0117', '673 Chestnut Court, Indianapolis, IN', 2, 3, 1, 1, '2024-08-10', 'Active', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(18, 'STU-2024-018', 'Evelyn', 'Young', '2005-11-19', 'Female', 'evelyn.young@student.edu', '+1-555-0118', '840 Beechwood Way, Salt Lake City, UT', 2, 3, 1, 1, '2024-08-10', 'Active', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(19, 'STU-2024-019', 'Jack', 'Hernandez', '2001-08-11', 'Male', 'jack.hernandez@student.edu', '+1-555-0119', '109 Linden Avenue, Philadelphia, PA', 4, 5, 1, 1, '2024-08-10', 'Active', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(20, 'STU-2024-020', 'Abigail', 'King', '2002-01-24', 'Female', 'abigail.king@student.edu', '+1-555-0120', '391 Alder Street, Detroit, MI', 4, 5, 1, 1, '2024-08-10', 'Active', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(21, 'STU-2023-021', 'Daniel', 'Wright', '2004-10-02', 'Male', 'daniel.wright@student.edu', '+1-555-0121', '745 Laurel Lane, Tampa, FL', 1, 1, 2, 3, '2023-08-15', 'Active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(22, 'STU-2023-022', 'Emily', 'Scott', '2004-12-14', 'Female', 'emily.scott@student.edu', '+1-555-0122', '202 Hawthorn Drive, Kansas City, MO', 1, 1, 2, 3, '2023-08-15', 'Active', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(23, 'STU-2023-023', 'Logan', 'Torres', '2004-03-29', 'Male', 'logan.torres@student.edu', '+1-555-0123', '480 Aspen Loop, Charlotte, NC', 1, 1, 2, 3, '2023-08-15', 'Active', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(24, 'STU-2023-024', 'Chloe', 'Nguyen', '2004-06-08', 'Female', 'chloe.nguyen@student.edu', '+1-555-0124', '619 Boxwood Way, Las Vegas, NV', 1, 1, 2, 3, '2023-08-15', 'Active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Inactive students
(25, 'STU-2022-025', 'Samuel', 'Hill', '2003-05-16', 'Male', 'samuel.hill@student.edu', '+1-555-0125', '855 Maple Court, Orlando, FL', 1, 1, 2, 4, '2022-08-20', 'Inactive', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(26, 'STU-2023-026', 'Grace', 'Flores', '2004-08-20', 'Female', 'grace.flores@student.edu', '+1-555-0126', '933 Willow Run, Sacramento, CA', 3, 4, 2, 3, '2023-08-15', 'Inactive', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Graduated students
(27, 'STU-2020-027', 'David', 'Green', '2001-02-10', 'Male', 'david.green@student.edu', '+1-555-0127', '110 River Bend Road, San Antonio, TX', 1, 1, 4, 8, '2020-08-15', 'Graduated', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(28, 'STU-2020-028', 'Hannah', 'Adams', '2001-07-04', 'Female', 'hannah.adams@student.edu', '+1-555-0128', '420 Harbor View, San Francisco, CA', 4, 5, 2, 4, '2020-08-15', 'Graduated', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ----------------------------------------------------------
-- 6. ATTENDANCE (Multiple class dates for realistic stats)
-- Notice: Subject 5 (DBMS) for CSE Sem 3 students (IDs: 1, 2, 3, 4, 5, 21, 22, 23, 24)
-- We intentionally give Student 3 (Liam) and Student 5 (Ethan) low attendance (<75%)
-- ----------------------------------------------------------
INSERT INTO attendance (student_id, subject_id, attendance_date, status, remarks, recorded_by, created_at) VALUES
-- Date 1: 2026-09-01
(1, 5, '2026-09-01', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(2, 5, '2026-09-01', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(3, 5, '2026-09-01', 'ABSENT', 'Unexcused', 2, CURRENT_TIMESTAMP),
(4, 5, '2026-09-01', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(5, 5, '2026-09-01', 'ABSENT', 'Medical leave', 2, CURRENT_TIMESTAMP),
(21, 5, '2026-09-01', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(22, 5, '2026-09-01', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(23, 5, '2026-09-01', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(24, 5, '2026-09-01', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),

-- Date 2: 2026-09-03
(1, 5, '2026-09-03', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(2, 5, '2026-09-03', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(3, 5, '2026-09-03', 'ABSENT', 'Unexcused', 2, CURRENT_TIMESTAMP),
(4, 5, '2026-09-03', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(5, 5, '2026-09-03', 'ABSENT', 'Sick', 2, CURRENT_TIMESTAMP),
(21, 5, '2026-09-03', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(22, 5, '2026-09-03', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(23, 5, '2026-09-03', 'ABSENT', 'Excused', 2, CURRENT_TIMESTAMP),
(24, 5, '2026-09-03', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),

-- Date 3: 2026-09-05
(1, 5, '2026-09-05', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(2, 5, '2026-09-05', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(3, 5, '2026-09-05', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(4, 5, '2026-09-05', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(5, 5, '2026-09-05', 'ABSENT', 'Unexcused', 2, CURRENT_TIMESTAMP),
(21, 5, '2026-09-05', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(22, 5, '2026-09-05', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(23, 5, '2026-09-05', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(24, 5, '2026-09-05', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),

-- Date 4: 2026-09-08
(1, 5, '2026-09-08', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(2, 5, '2026-09-08', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(3, 5, '2026-09-08', 'ABSENT', 'Unexcused', 2, CURRENT_TIMESTAMP),
(4, 5, '2026-09-08', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(5, 5, '2026-09-08', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(21, 5, '2026-09-08', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(22, 5, '2026-09-08', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(23, 5, '2026-09-08', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(24, 5, '2026-09-08', 'ABSENT', 'Family event', 2, CURRENT_TIMESTAMP),

-- Date 5: 2026-09-10
(1, 5, '2026-09-10', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(2, 5, '2026-09-10', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(3, 5, '2026-09-10', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(4, 5, '2026-09-10', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(5, 5, '2026-09-10', 'ABSENT', 'Sick', 2, CURRENT_TIMESTAMP),
(21, 5, '2026-09-10', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(22, 5, '2026-09-10', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(23, 5, '2026-09-10', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),
(24, 5, '2026-09-10', 'PRESENT', 'On time', 2, CURRENT_TIMESTAMP),

-- Subject 6: Operating Systems (CS202) for Students 1, 2, 3, 4, 5
(1, 6, '2026-09-02', 'PRESENT', 'Participated in lab', 3, CURRENT_TIMESTAMP),
(2, 6, '2026-09-02', 'PRESENT', 'Participated in lab', 3, CURRENT_TIMESTAMP),
(3, 6, '2026-09-02', 'ABSENT', 'Absent without notice', 3, CURRENT_TIMESTAMP),
(4, 6, '2026-09-02', 'PRESENT', 'Participated in lab', 3, CURRENT_TIMESTAMP),
(5, 6, '2026-09-02', 'PRESENT', 'Participated in lab', 3, CURRENT_TIMESTAMP),

(1, 6, '2026-09-04', 'PRESENT', 'Good work', 3, CURRENT_TIMESTAMP),
(2, 6, '2026-09-04', 'PRESENT', 'Good work', 3, CURRENT_TIMESTAMP),
(3, 6, '2026-09-04', 'ABSENT', 'Unexcused', 3, CURRENT_TIMESTAMP),
(4, 6, '2026-09-04', 'PRESENT', 'Good work', 3, CURRENT_TIMESTAMP),
(5, 6, '2026-09-04', 'ABSENT', 'Medical', 3, CURRENT_TIMESTAMP),

(1, 6, '2026-09-09', 'PRESENT', 'On time', 3, CURRENT_TIMESTAMP),
(2, 6, '2026-09-09', 'PRESENT', 'On time', 3, CURRENT_TIMESTAMP),
(3, 6, '2026-09-09', 'PRESENT', 'On time', 3, CURRENT_TIMESTAMP),
(4, 6, '2026-09-09', 'PRESENT', 'On time', 3, CURRENT_TIMESTAMP),
(5, 6, '2026-09-09', 'ABSENT', 'Unexcused', 3, CURRENT_TIMESTAMP);

-- ----------------------------------------------------------
-- 7. MARKS (Internal, Assignment, Exam -> Total, %, Grade)
-- Grading Scale:
-- A+ : 90 - 100
-- A  : 80 - 89.99
-- B+ : 70 - 79.99
-- B  : 60 - 69.99
-- C  : 50 - 59.99
-- F  : < 50
-- ----------------------------------------------------------
INSERT INTO marks (student_id, subject_id, internal_marks, assignment_marks, exam_marks, total_marks, percentage, grade, recorded_by, created_at, updated_at) VALUES
-- Student 1 (Alexander Wright)
(1, 5, 19.00, 19.50, 56.00, 94.50, 94.50, 'A+', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 6, 18.00, 18.00, 52.00, 88.00, 88.00, 'A', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Student 2 (Sophia Chen)
(2, 5, 19.50, 20.00, 58.00, 97.50, 97.50, 'A+', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 6, 19.00, 19.00, 55.00, 93.00, 93.00, 'A+', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Student 3 (Liam Miller)
(3, 5, 14.00, 15.00, 43.00, 72.00, 72.00, 'B+', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 6, 13.00, 14.00, 41.00, 68.00, 68.00, 'B', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Student 4 (Olivia Davis)
(4, 5, 17.50, 18.00, 50.50, 86.00, 86.00, 'A', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 6, 17.00, 17.50, 48.00, 82.50, 82.50, 'A', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Student 5 (Ethan Taylor)
(5, 5, 10.00, 11.00, 25.00, 46.00, 46.00, 'F', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 6, 11.00, 12.00, 31.00, 54.00, 54.00, 'C', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Student 6 (Ava Wilson - AI)
(6, 9, 18.50, 19.00, 54.00, 91.50, 91.50, 'A+', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 10, 17.00, 18.00, 50.00, 85.00, 85.00, 'A', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Student 7 (Noah Anderson - AI)
(7, 9, 15.00, 16.00, 45.00, 76.00, 76.00, 'B+', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 10, 16.00, 16.50, 46.00, 78.50, 78.50, 'B+', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Student 8 (Emma Thomas - AI)
(8, 9, 19.00, 19.50, 57.00, 95.50, 95.50, 'A+', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 10, 18.50, 19.00, 55.00, 92.50, 92.50, 'A+', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Student 9 (James Martinez - ECE)
(9, 13, 16.00, 17.00, 44.00, 77.00, 77.00, 'B+', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Student 10 (Mia Robinson - ECE)
(10, 13, 18.00, 18.50, 53.00, 89.50, 89.50, 'A', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Student 14 (Amelia Lee - Sem 1)
(14, 1, 18.00, 18.00, 53.00, 89.00, 89.00, 'A', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(14, 2, 19.00, 19.00, 56.00, 94.00, 94.00, 'A+', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Student 15 (Henry Walker - Sem 1)
(15, 1, 14.50, 15.00, 42.00, 71.50, 71.50, 'B+', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(15, 2, 13.00, 14.00, 38.00, 65.00, 65.00, 'B', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Student 19 (Jack Hernandez - MBA)
(19, 16, 18.00, 18.50, 52.00, 88.50, 88.50, 'A', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(19, 17, 19.00, 19.00, 54.00, 92.00, 92.00, 'A+', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Student 20 (Abigail King - MBA)
(20, 16, 17.00, 17.50, 49.00, 83.50, 83.50, 'A', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(20, 17, 18.00, 18.00, 51.00, 87.00, 87.00, 'A', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
