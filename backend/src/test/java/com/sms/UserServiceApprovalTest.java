package com.sms;

import com.sms.dao.StudentDao;
import com.sms.dao.UserDao;
import com.sms.model.Student;
import com.sms.model.User;
import com.sms.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
class UserServiceApprovalTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserDao userDao;

    @Autowired
    private StudentDao studentDao;

    @Test
    void quickApproveStudent_should_keep_single_name_without_enrolled_suffix() {
        User user = new User();
        user.setUsername("balaji.single");
        user.setEmail("balaji.single@example.com");
        user.setPasswordHash("test");
        user.setFullName("Balaji");
        user.setRole("STUDENT");
        user.setStatus("ACTIVE");
        user.setDepartmentId(1L);

        User saved = userDao.save(user);

        User updated = userService.quickApproveStudent(saved.getId());
        Student student = studentDao.findById(updated.getStudentId())
                .orElseThrow(() -> new AssertionError("Student should be created for approved user"));

        assertEquals("Balaji", student.getFirstName());
        assertTrue(student.getLastName() == null || student.getLastName().isBlank());
    }
}
