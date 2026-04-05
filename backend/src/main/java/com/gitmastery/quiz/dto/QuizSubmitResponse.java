package com.gitmastery.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class QuizSubmitResponse {
  private int total;
  private int correct;
  private int scorePercent;
}

