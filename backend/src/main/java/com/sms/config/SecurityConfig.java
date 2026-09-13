package com.sms.config;

import com.sms.security.JwtAuthFilter;
import com.sms.security.UserDetailsServiceImpl;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
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
     * BCrypt password encoder.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }


    /**
     * Authentication provider.
     *
     * Uses the application's UserDetailsService
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
     * Authentication manager.
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {

        return authConfig.getAuthenticationManager();
    }


    /**
     * Spring Security filter chain.
     */
    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http) throws Exception {

        http

                /*
                 * ---------------------------------------------------------
                 * CSRF
                 * ---------------------------------------------------------
                 *
                 * This application uses JWT authentication and is
                 * stateless, so CSRF protection is disabled.
                 */
                .csrf(AbstractHttpConfigurer::disable)

                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

                /*
                 * ---------------------------------------------------------
                 * CORS
                 * ---------------------------------------------------------
                 *
                 * Enables Spring Security's CORS integration.
                 *
                 * Your CORS configuration is handled separately
                 * by the application's WebConfig/CorsConfiguration.
                 */
                .cors(Customizer.withDefaults())


                /*
                 * ---------------------------------------------------------
                 * SESSION MANAGEMENT
                 * ---------------------------------------------------------
                 *
                 * JWT authentication does not use HTTP sessions.
                 */
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )


                /*
                 * ---------------------------------------------------------
                 * HEADERS
                 * ---------------------------------------------------------
                 *
                 * Required for the H2 console iframe.
                 */
                .headers(headers ->
                        headers.frameOptions(
                                HeadersConfigurer.FrameOptionsConfig::disable
                        )
                )


                /*
                 * ---------------------------------------------------------
                 * AUTHORIZATION
                 * ---------------------------------------------------------
                 */
                .authorizeHttpRequests(auth -> auth


                        /*
                         * -------------------------------------------------
                         * CORS PREFLIGHT
                         * -------------------------------------------------
                         *
                         * Browsers send OPTIONS requests before certain
                         * cross-origin API requests.
                         *
                         * Without this rule Spring Security can return
                         * 403 before the actual API request is made.
                         */
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()


                        /*
                         * -------------------------------------------------
                         * PUBLIC AUTHENTICATION ENDPOINTS
                         * -------------------------------------------------
                         */
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/logout",
                                "/api/auth/register",
                                "/api/auth/forgot-password",
                                "/api/auth/resend-otp",
                                "/api/auth/verify-otp",
                                "/api/auth/reset-password",
                                "/api/auth/departments"
                        ).permitAll()


                        /*
                         * -------------------------------------------------
                         * H2 CONSOLE
                         * -------------------------------------------------
                         */
                        .requestMatchers(
                                "/h2-console/**"
                        ).permitAll()


                        /*
                         * -------------------------------------------------
                         * ADMIN USER MANAGEMENT
                         * -------------------------------------------------
                         */
                        .requestMatchers(
                                "/api/users/**"
                        ).hasRole("ADMIN")


                        /*
                         * -------------------------------------------------
                         * ALL OTHER ENDPOINTS
                         * -------------------------------------------------
                         *
                         * Dashboard, students, departments, courses,
                         * subjects, attendance, marks, reports, etc.
                         * require a valid JWT.
                         */
                        .anyRequest().authenticated()
                );


        /*
         * -------------------------------------------------------------
         * AUTHENTICATION PROVIDER
         * -------------------------------------------------------------
         */
        http.authenticationProvider(
                authenticationProvider()
        );


        /*
         * -------------------------------------------------------------
         * JWT AUTHENTICATION FILTER
         * -------------------------------------------------------------
         *
         * Runs the JWT filter before Spring Security's standard
         * username/password authentication filter.
         */
        http.addFilterBefore(
                jwtAuthFilter,
                UsernamePasswordAuthenticationFilter.class
        );


        /*
         * -------------------------------------------------------------
         * BUILD SECURITY FILTER CHAIN
         * -------------------------------------------------------------
         */
        return http.build();
    }
}