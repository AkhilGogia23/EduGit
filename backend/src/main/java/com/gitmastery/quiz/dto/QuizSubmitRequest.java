package com.gitmastery.quiz.dto;

import lombok.Data;

import java.util.List;

@Data
public class QuizSubmitRequest {
  private List<Answer> answers;

  @Data
  public static class Answer {
    private Long questionId;
    private String selectedAnswer;
  }
}

