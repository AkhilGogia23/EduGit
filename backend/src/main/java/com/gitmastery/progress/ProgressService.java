package com.gitmastery.progress;

import com.gitmastery.progress.dto.ProgressRequest;
import com.gitmastery.progress.dto.ProgressResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProgressService {
  private final UserProgressRepository repository;

  public ProgressResponse getProgress(String emailRaw) {
    String email = normalizeEmail(emailRaw);
    if (email.isBlank()) return ProgressResponse.empty("");
    return repository.findByEmail(email)
        .map(this::toResponse)
        .orElseGet(() -> ProgressResponse.empty(email));
  }

  public ProgressResponse saveProgress(ProgressRequest request) {
    String email = normalizeEmail(request.getEmail());
    if (email.isBlank()) return ProgressResponse.empty("");

    UserProgress p = repository.findByEmail(email).orElseGet(() -> UserProgress.builder().email(email).build());
    Set<Long> completed = request.getCompletedLessonIds() == null ? new LinkedHashSet<>() : new LinkedHashSet<>(request.getCompletedLessonIds());
    p.setCompletedLessonIds(completed);
    if (request.getQuizScore() != null) {
      p.setQuizScore(request.getQuizScore());
    }
    return toResponse(repository.save(p));
  }

  private String normalizeEmail(String email) {
    return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
  }

  private ProgressResponse toResponse(UserProgress p) {
    return ProgressResponse.builder()
        .email(p.getEmail())
        .completedLessonIds(p.getCompletedLessonIds() == null ? new LinkedHashSet<>() : p.getCompletedLessonIds())
        .quizScore(p.getQuizScore())
        .build();
  }
}

