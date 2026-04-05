package com.gitmastery.quiz;

import com.gitmastery.quiz.dto.QuizSubmitRequest;
import com.gitmastery.quiz.dto.QuizSubmitResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class QuizService {
  private final QuestionRepository questionRepository;

  public List<Question> getQuestions() {
    return questionRepository.findAll();
  }

  public QuizSubmitResponse submit(QuizSubmitRequest request) {
    List<Question> questions = questionRepository.findAll();
    Map<Long, String> correctById = new HashMap<>();
    for (Question q : questions) {
      correctById.put(q.getId(), q.getCorrectAnswer());
    }

    int total = questions.size();
    int correct = 0;
    if (request != null && request.getAnswers() != null) {
      for (QuizSubmitRequest.Answer a : request.getAnswers()) {
        if (a == null || a.getQuestionId() == null) continue;
        String correctAnswer = correctById.get(a.getQuestionId());
        if (correctAnswer != null && correctAnswer.equalsIgnoreCase(String.valueOf(a.getSelectedAnswer()).trim())) {
          correct++;
        }
      }
    }

    int scorePercent = total == 0 ? 0 : (int) Math.round((correct * 100.0) / total);
    return QuizSubmitResponse.builder().total(total).correct(correct).scorePercent(scorePercent).build();
  }
}

