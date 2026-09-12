package com.sms.security;

import com.sms.dao.UserDao;
import com.sms.model.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserDao userDao;

    public UserDetailsServiceImpl(UserDao userDao) {
        this.userDao = userDao;
    }

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        User user = userDao.findByUsernameOrEmail(usernameOrEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email or username: " + usernameOrEmail));
        return new CustomUserDetails(user);
    }
}
