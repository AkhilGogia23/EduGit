package com.gitmastery.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class AuthResponse {
  private boolean success;
  private String message;
  private Long userId;
  private String name;
  private String email;
}

