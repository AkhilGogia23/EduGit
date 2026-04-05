package com.gitmastery.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gitmastery.ai.dto.AiHelpResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class AIService {
  private static final String API_URL = "https://api.groq.com/openai/v1/chat/completions";
  private static final String FALLBACK_ANSWER = "AI service unavailable, please try again";

  private final RestTemplate restTemplate = new RestTemplate();
  private final ObjectMapper objectMapper = new ObjectMapper();

  @Value("${groq.api.key:}")
  private String apiKey;
  @Value("${groq.model:llama-3.3-70b-versatile}")
  private String model;

  public AiHelpResponse ask(String queryRaw) {
    try {
      String query = queryRaw == null ? "" : queryRaw.trim();
      if (query.isEmpty() || apiKey == null || apiKey.isBlank()) {
        return AiHelpResponse.builder().answer(FALLBACK_ANSWER).build();
      }

      Map<String, Object> payload = Map.of(
          "model", model,
          "messages", List.of(
              Map.of("role", "system", "content", "You are a Git expert. Always explain clearly, give steps, and include commands."),
              Map.of("role", "user", "content", query)
          )
      );

      HttpHeaders headers = new HttpHeaders();
      headers.setBearerAuth(apiKey);
      headers.setContentType(MediaType.APPLICATION_JSON);
      HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

      ResponseEntity<String> response = restTemplate.exchange(API_URL, HttpMethod.POST, entity, String.class);
      if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
        return AiHelpResponse.builder().answer(FALLBACK_ANSWER).build();
      }

      JsonNode root = objectMapper.readTree(response.getBody());
      JsonNode contentNode = root.path("choices").path(0).path("message").path("content");
      String answer = contentNode.isMissingNode() ? FALLBACK_ANSWER : contentNode.asText(FALLBACK_ANSWER);
      if (answer == null || answer.isBlank()) answer = FALLBACK_ANSWER;
      return AiHelpResponse.builder().answer(answer).build();
    } catch (Exception e) {
      return AiHelpResponse.builder().answer(FALLBACK_ANSWER).build();
    }
  }
}

