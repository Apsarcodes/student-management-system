package com.sms.model;

import java.time.LocalDateTime;

public class OtpVerification {
    private Long id;
    private String email;
    private String purpose;
    private String otpHash;
    private LocalDateTime expiresAt;
    private int attempts;
    private LocalDateTime lastSentAt;
    private boolean verified;
    private LocalDateTime createdAt;

    public OtpVerification() {
    }

    public OtpVerification(Long id, String email, String purpose, String otpHash, LocalDateTime expiresAt,
                           int attempts, LocalDateTime lastSentAt, boolean verified, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.purpose = purpose;
        this.otpHash = otpHash;
        this.expiresAt = expiresAt;
        this.attempts = attempts;
        this.lastSentAt = lastSentAt;
        this.verified = verified;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getOtpHash() {
        return otpHash;
    }

    public void setOtpHash(String otpHash) {
        this.otpHash = otpHash;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public int getAttempts() {
        return attempts;
    }

    public void setAttempts(int attempts) {
        this.attempts = attempts;
    }

    public LocalDateTime getLastSentAt() {
        return lastSentAt;
    }

    public void setLastSentAt(LocalDateTime lastSentAt) {
        this.lastSentAt = lastSentAt;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
