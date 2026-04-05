package com.gitmastery.simulator;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Data
public class SimulatorState {
  private boolean initialized;
  private String currentBranch;
  private Set<String> branches;

  // branch -> commits (newest last)
  private Map<String, List<Commit>> commitsByBranch;

  // simple staging model
  private Set<String> stagedFiles;
  private Set<String> workingTreeFiles;

  // merge conflict model
  private boolean mergeConflict;
  private String conflictBranch;
  private String conflictedFile;

  // fake remote tracking
  private boolean remoteConfigured;

  public SimulatorState() {
    reset();
  }

  public void reset() {
    this.initialized = false;
    this.currentBranch = "main";
    this.branches = new LinkedHashSet<>(Set.of("main"));
    this.commitsByBranch = new LinkedHashMap<>();
    this.commitsByBranch.put("main", new ArrayList<>());
    this.stagedFiles = new LinkedHashSet<>();
    this.workingTreeFiles = new LinkedHashSet<>();
    this.mergeConflict = false;
    this.conflictBranch = null;
    this.conflictedFile = null;
    this.remoteConfigured = true; // assume origin exists (educational demo)
  }

  @Data
  @Builder
  public static class Commit {
    private String id;
    private String message;
    private Instant timestamp;
    private String branch;
  }
}

