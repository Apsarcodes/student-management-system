package com.sms.dto;

import com.sms.model.Student;
import com.sms.model.User;

public class PendingStudentResponse {
    private User user;
    private Student suggestedMatch;

    public PendingStudentResponse() {}

    public PendingStudentResponse(User user, Student suggestedMatch) {
        this.user = user;
        this.suggestedMatch = suggestedMatch;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Student getSuggestedMatch() {
        return suggestedMatch;
    }

    public void setSuggestedMatch(Student suggestedMatch) {
        this.suggestedMatch = suggestedMatch;
    }
}