package com.sms.security;

import com.sms.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class CustomUserDetails implements UserDetails {
    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    public User getUser() {
        return user;
    }

    public Long getId() {
        return user.getId();
    }

    public String getFullName() {
        return user.getFullName();
    }

    public String getRole() {
        return user.getRole();
    }

    public Long getStudentId() {
        return user.getStudentId();
    }

    public Long getDepartmentId() {
        return user.getDepartmentId();
    }

    public String getDepartmentCode() {
        return user.getDepartmentCode();
    }

    public String getDepartmentName() {
        return user.getDepartmentName();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()));
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getEmail(); // Use email as principal username
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !"INACTIVE".equalsIgnoreCase(user.getStatus());
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return "ACTIVE".equalsIgnoreCase(user.getStatus());
    }
}
