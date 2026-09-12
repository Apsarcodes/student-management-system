package com.sms;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("dev")
class StudentManagementApplicationTests {

    @Test
    void contextLoads() {
        // Verifies Spring context, database schema, and DAOs load cleanly
    }
}
