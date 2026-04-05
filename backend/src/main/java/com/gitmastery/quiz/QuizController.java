package com.gitmastery.quiz;

import com.gitmastery.quiz.dto.QuizSubmitRequest;
import com.gitmastery.quiz.dto.QuizSubmitResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {
  private final QuizService quizService;

  @GetMapping
  public List<Question> getQuiz() {
    return quizService.getQuestions();
  }

  @PostMapping("/submit")
  public QuizSubmitResponse submit(@RequestBody QuizSubmitRequest request) {
    return quizService.submit(request);
  }
}

