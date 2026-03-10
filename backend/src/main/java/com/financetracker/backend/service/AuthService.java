package com.financetracker.backend.service;

import com.financetracker.backend.entity.User;
import com.financetracker.backend.payload.AuthDtos;

public interface AuthService {

    User register(AuthDtos.RegisterRequest request);

    String login(AuthDtos.LoginRequest request);
}
