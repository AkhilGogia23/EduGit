package com.gitmastery.ai;

import com.gitmastery.ai.dto.AiHelpRequest;
import com.gitmastery.ai.dto.AiHelpResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {
  private final AIService aiService;

  @PostMapping("/help")
  public AiHelpResponse help(@RequestBody AiHelpRequest request) {
    String query = request == null ? "" : request.getQuery();
    return aiService.ask(query);
  }
}

