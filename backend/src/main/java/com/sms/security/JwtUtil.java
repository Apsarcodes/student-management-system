package com.sms.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {
    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms:86400000}") // 24 hours default
    private long jwtExpirationMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(CustomUserDetails userDetails, boolean rememberMe) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userDetails.getId());
        claims.put("role", userDetails.getRole());
        claims.put("fullName", userDetails.getFullName());
        if (userDetails.getStudentId() != null) {
            claims.put("studentId", userDetails.getStudentId());
        }
        if (userDetails.getDepartmentId() != null) {
            claims.put("departmentId", userDetails.getDepartmentId());
            claims.put("departmentCode", userDetails.getDepartmentCode());
            claims.put("departmentName", userDetails.getDepartmentName());
        }

        long expiration = rememberMe ? (jwtExpirationMs * 7) : jwtExpirationMs; // 7 days if remember me

        return Jwts.builder()
                .claims(claims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Long extractStudentId(String token) {
        Claims claims = extractAllClaims(token);
        Object sid = claims.get("studentId");
        if (sid instanceof Number num) {
            return num.longValue();
        }
        return null;
    }

    public Long extractDepartmentId(String token) {
        Claims claims = extractAllClaims(token);
        Object did = claims.get("departmentId");
        if (did instanceof Number num) {
            return num.longValue();
        }
        return null;
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid JWT signature/token: {}", e.getMessage());
        }
        return false;
    }
}
