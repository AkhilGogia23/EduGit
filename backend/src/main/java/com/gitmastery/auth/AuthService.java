package com.gitmastery.auth;

import com.gitmastery.auth.dto.AuthRequest;
import com.gitmastery.auth.dto.AuthResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
  private final UserRepository userRepository;

  public AuthResponse register(AuthRequest request) {
    String email = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();
    String name = request.getName() == null ? "" : request.getName().trim();
    String password = request.getPassword() == null ? "" : request.getPassword().trim();

    if (name.isBlank() || email.isBlank() || password.isBlank()) {
      return AuthResponse.builder().success(false).message("Name, email, and password are required.").build();
    }
    if (userRepository.existsByEmail(email)) {
      return AuthResponse.builder().success(false).message("Email already registered.").build();
    }

    User user = userRepository.save(User.builder().name(name).email(email).password(password).build());
    return AuthResponse.builder()
        .success(true)
        .message("Registration successful.")
        .userId(user.getId())
        .name(user.getName())
        .email(user.getEmail())
        .build();
  }

  public AuthResponse login(AuthRequest request) {
    String email = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();
    String password = request.getPassword() == null ? "" : request.getPassword().trim();
    if (email.isBlank() || password.isBlank()) {
      return AuthResponse.builder().success(false).message("Email and password are required.").build();
    }

    return userRepository.findByEmail(email)
        .filter(u -> u.getPassword().equals(password))
        .map(u -> AuthResponse.builder()
            .success(true)
            .message("Login successful.")
            .userId(u.getId())
            .name(u.getName())
            .email(u.getEmail())
            .build())
        .orElseGet(() -> AuthResponse.builder().success(false).message("Invalid email or password.").build());
  }
}

