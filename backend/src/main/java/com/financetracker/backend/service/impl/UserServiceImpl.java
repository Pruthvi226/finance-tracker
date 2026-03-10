package com.financetracker.backend.service.impl;

import com.financetracker.backend.dto.ProfileDto;
import com.financetracker.backend.entity.User;
import com.financetracker.backend.exception.ResourceNotFoundException;
import com.financetracker.backend.repository.UserRepository;
import com.financetracker.backend.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public ProfileDto getCurrentUserProfile() {
        User user = getCurrentUserEntity();
        ProfileDto dto = new ProfileDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        return dto;
    }

    @Override
    @Transactional
    public ProfileDto updateCurrentUserProfile(ProfileDto profileDto) {
        User user = getCurrentUserEntity();
        user.setName(profileDto.getName());
        // Email updates are possible but should be validated for uniqueness
        user.setEmail(profileDto.getEmail());
        User saved = userRepository.save(user);

        ProfileDto dto = new ProfileDto();
        dto.setId(saved.getId());
        dto.setName(saved.getName());
        dto.setEmail(saved.getEmail());
        return dto;
    }

    @Override
    public User getCurrentUserEntity() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}

