package com.gitmastery.progress;

import com.gitmastery.progress.dto.ProgressRequest;
import com.gitmastery.progress.dto.ProgressResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {
  private final ProgressService progressService;

  @PostMapping
  public ProgressResponse save(@RequestBody ProgressRequest request) {
    return progressService.saveProgress(request);
  }

  @GetMapping
  public ProgressResponse get(@RequestParam(name = "email", required = false) String email) {
    return progressService.getProgress(email);
  }
}

