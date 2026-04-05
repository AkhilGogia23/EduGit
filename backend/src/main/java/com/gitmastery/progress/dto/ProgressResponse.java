package com.gitmastery.progress.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.LinkedHashSet;
import java.util.Set;

@Data
@AllArgsConstructor
@Builder
public class ProgressResponse {
  private String email;
  private Set<Long> completedLessonIds;
  private int quizScore;

  public static ProgressResponse empty(String email) {
    return ProgressResponse.builder()
        .email(email)
        .completedLessonIds(new LinkedHashSet<>())
        .quizScore(0)
        .build();
  }
}

