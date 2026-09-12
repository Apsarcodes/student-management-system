package com.sms;

import com.sms.dao.DepartmentDao;
import com.sms.dao.StudentDao;
import com.sms.model.Department;
import com.sms.model.Student;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
class StudentDaoIntegrationTest {

    @Autowired
    private StudentDao studentDao;

    @Autowired
    private DepartmentDao departmentDao;

    @Test
    void testDepartmentListAndCount() {
        List<Department> depts = departmentDao.findAll();
        assertFalse(depts.isEmpty());
        assertTrue(depts.size() >= 4);
    }

    @Test
    void testSearchStudentsWithFilters() {
        List<Student> activeStudents = studentDao.searchStudents(
                null, null, null, null, null, "Active",
                "id", "DESC", 0, 10
        );
        assertNotNull(activeStudents);
        assertFalse(activeStudents.isEmpty());

        long count = studentDao.countStudents(null, null, null, null, null, "Active");
        assertTrue(count >= 20);
    }

    @Test
    void testStudentCRUD() {
        Student s = new Student();
        s.setStudentId("TEST-2026-999");
        s.setFirstName("Unit");
        s.setLastName("Tester");
        s.setDateOfBirth(LocalDate.of(2004, 1, 1));
        s.setGender("Other");
        s.setEmail("unit.tester@student.edu");
        s.setPhone("+1-555-9999");
        s.setAddress("123 Test Street");
        s.setDepartmentId(1L);
        s.setCourseId(1L);
        s.setAcademicYear(1);
        s.setSemester(1);
        s.setAdmissionDate(LocalDate.now());
        s.setStatus("Active");

        Student saved = studentDao.save(s);
        assertNotNull(saved.getId());

        Optional<Student> found = studentDao.findById(saved.getId());
        assertTrue(found.isPresent());
        assertEquals("Unit Tester", found.get().getFullName());

        saved.setPhone("+1-555-8888");
        studentDao.update(saved);
        Optional<Student> updated = studentDao.findById(saved.getId());
        assertEquals("+1-555-8888", updated.get().getPhone());

        studentDao.deleteById(saved.getId());
        assertFalse(studentDao.findById(saved.getId()).isPresent());
    }
}
