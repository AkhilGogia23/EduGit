package com.gitmastery.lesson;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonService {
  private final LessonRepository lessonRepository;

  public List<Lesson> getLessons() {
    return lessonRepository.findAll();
  }
}

