package com.gitmastery.progress.dto;

import lombok.Data;

import java.util.LinkedHashSet;
import java.util.Set;

@Data
public class ProgressRequest {
  private String email;
  private Set<Long> completedLessonIds = new LinkedHashSet<>();
  private Integer quizScore;
}

