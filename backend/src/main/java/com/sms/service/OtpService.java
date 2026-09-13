package com.sms.service;

import com.sms.dao.OtpDao;
import com.sms.exception.BadRequestException;
import com.sms.model.OtpVerification;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Optional;

@Service
public class OtpService {
    private static final SecureRandom RANDOM = new SecureRandom();

    private final OtpDao otpDao;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final long expiryMinutes;
    private final int maxAttempts;
    private final long resendSeconds;

    public OtpService(
            OtpDao otpDao,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            @Value("${app.otp.expiry-minutes:${OTP_EXPIRY_MINUTES:10}}") long expiryMinutes,
            @Value("${app.otp.max-attempts:${OTP_MAX_ATTEMPTS:5}}") int maxAttempts,
            @Value("${app.otp.resend-seconds:${OTP_RESEND_SECONDS:60}}") long resendSeconds
    ) {
        this.otpDao = otpDao;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.expiryMinutes = expiryMinutes;
        this.maxAttempts = maxAttempts;
        this.resendSeconds = resendSeconds;
    }

    public OtpVerification createAndSendOtp(String email, String purpose) {
        String normalizedEmail = normalizeEmail(email);
        String normalizedPurpose = normalizePurpose(purpose);

        String otp = generateOtp();
        String hashedOtp = passwordEncoder.encode(otp);
        LocalDateTime now = LocalDateTime.now();

        otpDao.deleteByEmailAndPurpose(normalizedEmail, normalizedPurpose);

        OtpVerification record = new OtpVerification();
        record.setEmail(normalizedEmail);
        record.setPurpose(normalizedPurpose);
        record.setOtpHash(hashedOtp);
        record.setExpiresAt(now.plusMinutes(expiryMinutes));
        record.setAttempts(0);
        record.setLastSentAt(now);
        record.setVerified(false);
        otpDao.save(record);

        emailService.sendOtpEmail(normalizedEmail, normalizedPurpose, otp);
        return record;
    }

    public OtpVerification resendOtp(String email, String purpose) {
        String normalizedEmail = normalizeEmail(email);
        String normalizedPurpose = normalizePurpose(purpose);
        LocalDateTime now = LocalDateTime.now();

        Optional<OtpVerification> existing = otpDao.findByEmailAndPurpose(normalizedEmail, normalizedPurpose);
        if (existing.isPresent()) {
            OtpVerification current = existing.get();
            if (current.getLastSentAt() != null && current.getLastSentAt().plusSeconds(resendSeconds).isAfter(now)) {
                throw new BadRequestException("Please wait before requesting a new OTP.");
            }
        }

        return createAndSendOtp(normalizedEmail, normalizedPurpose);
    }

    public OtpVerification verifyOtp(String email, String otpInput, String purpose) {
        String normalizedEmail = normalizeEmail(email);
        String normalizedPurpose = normalizePurpose(purpose);

        OtpVerification otp = otpDao.findByEmailAndPurpose(normalizedEmail, normalizedPurpose)
                .orElseThrow(() -> new BadRequestException("Invalid OTP or OTP has expired."));

        if (otp.getExpiresAt() == null || otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }

        if (otp.getAttempts() >= maxAttempts) {
            throw new BadRequestException("Maximum verification attempts reached. Please request a new OTP.");
        }

        if (!passwordEncoder.matches(otpInput, otp.getOtpHash())) {
            otp.setAttempts(otp.getAttempts() + 1);
            otpDao.update(otp);

            if (otp.getAttempts() >= maxAttempts) {
                throw new BadRequestException("Maximum verification attempts reached. Please request a new OTP.");
            }

            throw new BadRequestException("Invalid OTP. Please try again.");
        }

        otp.setAttempts(0);
        otp.setVerified(true);
        otp.setLastSentAt(LocalDateTime.now());
        otpDao.update(otp);
        return otp;
    }

    public OtpVerification requireVerifiedOtp(String email, String purpose) {
        String normalizedEmail = normalizeEmail(email);
        String normalizedPurpose = normalizePurpose(purpose);

        OtpVerification otp = otpDao.findByEmailAndPurpose(normalizedEmail, normalizedPurpose)
                .orElseThrow(() -> new BadRequestException("Verification is required before resetting the password."));

        if (otp.getExpiresAt() != null && otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }

        if (!otp.isVerified()) {
            throw new BadRequestException("Verification is required before resetting the password.");
        }

        return otp;
    }

    public void deleteOtp(String email, String purpose) {
        otpDao.deleteByEmailAndPurpose(normalizeEmail(email), normalizePurpose(purpose));
    }

    public String generateOtp() {
        int otp = 100000 + RANDOM.nextInt(900000);
        return String.valueOf(otp);
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            throw new BadRequestException("Email is required.");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizePurpose(String purpose) {
        if (purpose == null) {
            throw new BadRequestException("OTP purpose is required.");
        }
        String normalized = purpose.trim().toUpperCase(Locale.ROOT);
        if (!"REGISTRATION".equals(normalized) && !"PASSWORD_RESET".equals(normalized)) {
            throw new BadRequestException("Unsupported OTP purpose.");
        }
        return normalized;
    }
}
