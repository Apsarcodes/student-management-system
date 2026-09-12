package com.sms.config;

import com.sms.security.JwtAuthFilter;
import com.sms.security.UserDetailsServiceImpl;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;

    public SecurityConfig(
            JwtAuthFilter jwtAuthFilter,
            UserDetailsServiceImpl userDetailsService) {

        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Password encoder used for user authentication.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Authentication provider using our custom UserDetailsService
     * and BCrypt password encoder.
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider authProvider =
                new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    /**
     * Authentication manager used by the authentication service.
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {

        return authConfig.getAuthenticationManager();
    }

    /**
     * Main Spring Security configuration.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http)
            throws Exception {

        http
                // JWT authentication is stateless, so CSRF is disabled.
                .csrf(AbstractHttpConfigurer::disable)

                // Enable Spring Security CORS handling.
                .cors(AbstractHttpConfigurer::withDefaults)

                // Do not create HTTP sessions.
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // Allow H2 console iframe rendering.
                .headers(headers ->
                        headers.frameOptions(
                                HeadersConfigurer.FrameOptionsConfig::disable
                        )
                )

                // Authorization rules.
                .authorizeHttpRequests(auth -> auth

                        // IMPORTANT:
                        // Allow browser CORS preflight requests.
                        // This fixes OPTIONS /api/dashboard/stats → 403.
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        // Public authentication endpoints.
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/logout",
                                "/api/auth/register",
                                "/api/auth/departments"
                        ).permitAll()

                        // H2 database console.
                        .requestMatchers(
                                "/h2-console/**"
                        ).permitAll()

                        // Admin-only user management.
                        .requestMatchers(
                                "/api/users/**"
                        ).hasRole("ADMIN")

                        // All remaining API endpoints require authentication.
                        .anyRequest().authenticated()
                );

        // Register our DAO authentication provider.
        http.authenticationProvider(authenticationProvider());

        // Run JWT authentication before Spring's username/password filter.
        http.addFilterBefore(
                jwtAuthFilter,
                UsernamePasswordAuthenticationFilter.class
        );

        return http.build();
    }
}