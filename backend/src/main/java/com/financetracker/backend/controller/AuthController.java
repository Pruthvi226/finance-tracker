package com.financetracker.backend.controller;

import com.financetracker.backend.entity.User;
import com.financetracker.backend.payload.AuthDtos;
import com.financetracker.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody AuthDtos.RegisterRequest request) {
        User user = authService.register(request);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDtos.JwtAuthenticationResponse> login(
            @Valid @RequestBody AuthDtos.LoginRequest request) {
        String token = authService.login(request);
        return ResponseEntity.ok(new AuthDtos.JwtAuthenticationResponse(token));
    }
}

