package com.gitmastery.simulator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
@Builder
public class SimulateResponse {
  private boolean success;
  private String output;

  // Optional educational fields (keeps existing clients working)
  private String explanation;
  private String nextSuggestion;

  // Optional scenario guidance (e.g., merge conflict)
  private Scenario scenario;

  @Data
  @AllArgsConstructor
  @Builder
  public static class Scenario {
    private String type; // e.g. "MERGE_CONFLICT", "BRANCH_WORKFLOW"
    private String title;
    private List<String> steps;
  }
}

