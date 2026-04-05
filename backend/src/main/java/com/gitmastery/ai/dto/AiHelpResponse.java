package com.gitmastery.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class AiHelpResponse {
  private String answer;
}

