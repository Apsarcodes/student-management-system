package com.sms.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    @NotBlank(message = "Email or username is required")
    private String usernameOrEmail;

    @NotBlank(message = "Password is required")
    private String password;

    private boolean rememberMe;

    public LoginRequest() {}

    public String getUsernameOrEmail() { return usernameOrEmail; }
    public void setUsernameOrEmail(String usernameOrEmail) { this.usernameOrEmail = usernameOrEmail; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public boolean isRememberMe() { return rememberMe; }
    public void setRememberMe(boolean rememberMe) { this.rememberMe = rememberMe; }
}
