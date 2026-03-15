package com.financetracker.backend.service;

import com.financetracker.backend.dto.NotificationDto;
import com.financetracker.backend.dto.PageResponse;
import com.financetracker.backend.entity.User;

import java.util.List;

public interface NotificationService {
    NotificationDto createNotification(User user, String title, String message);
    PageResponse<NotificationDto> getUserNotifications(int pageNo, int pageSize);
    List<NotificationDto> getUnreadNotifications();
    long getUnreadCount();
    NotificationDto markAsRead(Long id);
    void markAllAsRead();
}
