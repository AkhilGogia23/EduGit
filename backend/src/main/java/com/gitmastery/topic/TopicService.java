package com.gitmastery.topic;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TopicService {
  private final TopicRepository topicRepository;

  public List<Topic> getTopics() {
    return topicRepository.findAll();
  }
}

