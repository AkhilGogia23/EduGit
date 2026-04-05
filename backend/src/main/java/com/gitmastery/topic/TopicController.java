package com.gitmastery.topic;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class TopicController {
  private final TopicService topicService;

  @GetMapping
  public List<Topic> getTopics() {
    return topicService.getTopics();
  }
}

