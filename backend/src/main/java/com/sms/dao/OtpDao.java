package com.sms.dao;

import com.sms.model.OtpVerification;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public class OtpDao {
    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<OtpVerification> otpRowMapper = (rs, rowNum) -> {
        OtpVerification otp = new OtpVerification();
        otp.setId(rs.getLong("id"));
        otp.setEmail(rs.getString("email"));
        otp.setPurpose(rs.getString("purpose"));
        otp.setOtpHash(rs.getString("otp_hash"));
        Timestamp expiresAt = rs.getTimestamp("expires_at");
        if (expiresAt != null) {
            otp.setExpiresAt(expiresAt.toLocalDateTime());
        }
        otp.setAttempts(rs.getInt("attempts"));
        Timestamp lastSentAt = rs.getTimestamp("last_sent_at");
        if (lastSentAt != null) {
            otp.setLastSentAt(lastSentAt.toLocalDateTime());
        }
        otp.setVerified(rs.getBoolean("verified"));
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            otp.setCreatedAt(createdAt.toLocalDateTime());
        }
        return otp;
    };

    public OtpDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<OtpVerification> findByEmailAndPurpose(String email, String purpose) {
        String sql = "SELECT * FROM otp_verifications WHERE LOWER(email) = LOWER(?) AND purpose = ?";
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, otpRowMapper, email, purpose));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public OtpVerification save(OtpVerification otp) {
        String sql = "INSERT INTO otp_verifications (email, purpose, otp_hash, expires_at, attempts, last_sent_at, verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        LocalDateTime now = LocalDateTime.now();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, otp.getEmail());
            ps.setString(2, otp.getPurpose());
            ps.setString(3, otp.getOtpHash());
            ps.setTimestamp(4, Timestamp.valueOf(otp.getExpiresAt()));
            ps.setInt(5, otp.getAttempts());
            ps.setTimestamp(6, Timestamp.valueOf(otp.getLastSentAt() != null ? otp.getLastSentAt() : now));
            ps.setBoolean(7, otp.isVerified());
            ps.setTimestamp(8, Timestamp.valueOf(now));
            return ps;
        }, keyHolder);

        if (keyHolder.getKey() != null) {
            otp.setId(keyHolder.getKey().longValue());
        }
        return otp;
    }

    public void update(OtpVerification otp) {
        String sql = "UPDATE otp_verifications SET otp_hash = ?, expires_at = ?, attempts = ?, last_sent_at = ?, verified = ?, email = ?, purpose = ? WHERE id = ?";
        jdbcTemplate.update(
                sql,
                otp.getOtpHash(),
                Timestamp.valueOf(otp.getExpiresAt()),
                otp.getAttempts(),
                Timestamp.valueOf(otp.getLastSentAt() != null ? otp.getLastSentAt() : LocalDateTime.now()),
                otp.isVerified(),
                otp.getEmail(),
                otp.getPurpose(),
                otp.getId()
        );
    }

    public void deleteByEmailAndPurpose(String email, String purpose) {
        String sql = "DELETE FROM otp_verifications WHERE LOWER(email) = LOWER(?) AND purpose = ?";
        jdbcTemplate.update(sql, email, purpose);
    }

    public void deleteById(Long id) {
        String sql = "DELETE FROM otp_verifications WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }
}
