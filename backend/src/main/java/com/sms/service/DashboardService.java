package com.sms.service;

import com.sms.dao.DashboardDao;
import com.sms.dto.DashboardStatsDto;
import com.sms.model.User;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
    private final DashboardDao dashboardDao;
    private final AuthService authService;

    public DashboardService(DashboardDao dashboardDao, AuthService authService) {
        this.dashboardDao = dashboardDao;
        this.authService = authService;
    }

    public DashboardStatsDto getDashboardStats() {
        try {
            User currentUser = authService.getCurrentUser();
            if (currentUser != null && "STAFF".equalsIgnoreCase(currentUser.getRole()) && currentUser.getDepartmentId() != null) {
                return dashboardDao.getDashboardStatsByDepartment(currentUser.getDepartmentId());
            }
        } catch (Exception ignored) {}

        return dashboardDao.getDashboardStats();
    }
}
