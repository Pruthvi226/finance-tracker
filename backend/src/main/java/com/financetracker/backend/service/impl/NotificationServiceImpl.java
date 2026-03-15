package com.financetracker.backend.service.impl;

import com.financetracker.backend.dto.NotificationDto;
import com.financetracker.backend.dto.PageResponse;
import com.financetracker.backend.entity.Notification;
import com.financetracker.backend.entity.User;
import com.financetracker.backend.exception.ResourceNotFoundException;
import com.financetracker.backend.repository.NotificationRepository;
import com.financetracker.backend.service.NotificationService;
import com.financetracker.backend.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    public NotificationServiceImpl(NotificationRepository notificationRepository, UserService userService) {
        this.notificationRepository = notificationRepository;
        this.userService = userService;
    }

    @Override
    public NotificationDto createNotification(User user, String title, String message) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        
        Notification saved = notificationRepository.save(notification);
        return mapToDto(saved);
    }

    @Override
    public PageResponse<NotificationDto> getUserNotifications(int pageNo, int pageSize) {
        User user = userService.getCurrentUserEntity();
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("createdAt").descending());
        
        Page<Notification> page = notificationRepository.findByUserId(user.getId(), pageable);
        
        List<NotificationDto> content = page.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
                
        return new PageResponse<>(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Override
    public List<NotificationDto> getUnreadNotifications() {
        User user = userService.getCurrentUserEntity();
        return notificationRepository.findByUserIdAndIsReadFalse(user.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public long getUnreadCount() {
        User user = userService.getCurrentUserEntity();
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @Override
    public NotificationDto markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        
        User user = userService.getCurrentUserEntity();
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Cannot modify other users' notifications");
        }
        
        notification.setRead(true);
        return mapToDto(notificationRepository.save(notification));
    }

    @Override
    public void markAllAsRead() {
        User user = userService.getCurrentUserEntity();
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(user.getId());
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    private NotificationDto mapToDto(Notification notification) {
        NotificationDto dto = new NotificationDto();
        dto.setId(notification.getId());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}
