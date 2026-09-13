package com.sms.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final Resend resend;
    private final String mailFrom;

    public EmailService(
            @Value("${RESEND_API_KEY}") String apiKey,
            @Value("${app.mail.from:${MAIL_FROM:onboarding@resend.dev}}") String mailFrom
    ) {
        this.mailFrom = mailFrom;
        this.resend = (apiKey == null || apiKey.isBlank()) ? null : new Resend(apiKey);
    }

    public void sendOtpEmail(String toEmail, String purpose, String otp) {
        if (resend == null) {
            throw new IllegalStateException("Resend API key is not configured.");
        }

        String displayPurpose = "Registration".equalsIgnoreCase(purpose) ? "Registration" : "Password Reset";
        String expiryText = "10 minutes";
        String html = "<div style=\"font-family: Arial, sans-serif; background:#f8fafc; padding:24px;\">"
                + "<div style=\"max-width:560px; margin:0 auto; background:#ffffff; border-radius:16px; border:1px solid #e2e8f0; padding:32px;\">"
                + "<h2 style=\"margin:0 0 16px; color:#0f172a; font-size:28px;\">Student Management System</h2>"
                + "<p style=\"margin:0 0 12px; color:#334155; font-size:16px;\">Your OTP for <strong>" + displayPurpose + "</strong> is:</p>"
                + "<div style=\"margin:20px 0; background:#eef2ff; border:1px solid #c7d2fe; border-radius:12px; text-align:center; padding:20px;\">"
                + "<div style=\"font-size:34px; letter-spacing:8px; font-weight:700; color:#1e3a8a;\">" + otp + "</div>"
                + "</div>"
                + "<p style=\"margin:0 0 12px; color:#475569; font-size:15px;\">This code expires in <strong>" + expiryText + "</strong>.</p>"
                + "<p style=\"margin:0; color:#475569; font-size:14px;\">Do not share this OTP with anyone. For security reasons, never disclose it to anyone claiming to be support staff.</p>"
                + "</div>"
                + "</div>";

        CreateEmailOptions options = CreateEmailOptions.builder()
                .from(mailFrom)
                .to(toEmail)
                .subject("Your Student Management System OTP: " + displayPurpose)
                .html(html)
                .build();

        try {
            resend.emails().send(options);
        } catch (ResendException e) {
            log.error("Failed to send OTP email to {} for purpose {}: {}", toEmail, purpose, e.getMessage());
            throw new IllegalStateException("Unable to send OTP email. Please try again later.", e);
        }
    }
}
