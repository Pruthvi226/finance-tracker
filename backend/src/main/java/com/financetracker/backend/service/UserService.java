package com.financetracker.backend.service;

import com.financetracker.backend.dto.ProfileDto;
import com.financetracker.backend.entity.User;

public interface UserService {

    ProfileDto getCurrentUserProfile();

    ProfileDto updateCurrentUserProfile(ProfileDto profileDto);

    User getCurrentUserEntity();
}

