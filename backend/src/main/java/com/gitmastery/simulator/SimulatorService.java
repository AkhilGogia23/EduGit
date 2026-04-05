package com.gitmastery.simulator;

import com.gitmastery.simulator.dto.SimulateResponse;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SimulatorService {
  private static final Pattern COMMIT_PATTERN =
      Pattern.compile("^git\\s+commit\\s+-m\\s+(\"([^\"]*)\"|'([^']*)')\\s*$", Pattern.CASE_INSENSITIVE);
  private static final Pattern CHECKOUT_NEW_PATTERN =
      Pattern.compile("^git\\s+checkout\\s+-b\\s+([\\w\\-/\\.]+)\\s*$", Pattern.CASE_INSENSITIVE);
  private static final Pattern CHECKOUT_PATTERN =
      Pattern.compile("^git\\s+checkout\\s+([\\w\\-/\\.]+)\\s*$", Pattern.CASE_INSENSITIVE);
  private static final Pattern MERGE_PATTERN =
      Pattern.compile("^git\\s+merge\\s+([\\w\\-/\\.]+)\\s*$", Pattern.CASE_INSENSITIVE);

  private final SimulatorState state = new SimulatorState();

  public SimulateResponse simulate(String commandRaw) {
    String command = commandRaw == null ? "" : commandRaw.trim();
    if (command.isEmpty()) {
      return err(
          "error: please enter a git command",
          "The simulator expects a Git command like `git status` or `git commit -m \"message\"`.",
          "Try: git status");
    }

    String normalized = command.replaceAll("\\s+", " ").trim();
    String normalizedLower = normalized.toLowerCase(Locale.ROOT);

    synchronized (state) {
      if (equalsIgnoreCaseExact(normalized, "git init")) {
        state.reset();
        state.setInitialized(true);
        state.getWorkingTreeFiles().add("README.md");
        state.getWorkingTreeFiles().add("src/App.jsx");
        return ok(
            "Initialized empty Git repository in /repo/.git/",
            "Creates a new Git repository by making a `.git` directory (simulated).",
            "Next: git status");
      }

      // Helpful guard: most commands need init first
      if (!state.isInitialized() && !equalsIgnoreCaseExact(normalized, "git init")) {
        return err(
            "error: not a git repository (or any of the parent directories): .git",
            "You need to initialize a repository before Git can track branches, commits, and files.",
            "Run: git init");
      }

      // Merge-conflict guard: teach flow while still allowing key commands
      if (state.isMergeConflict()) {
        if (equalsIgnoreCaseExact(normalized, "git status")) {
          return ok(
              conflictStatusOutput(),
              "Shows you which files are conflicted and what Git expects next.",
              "Resolve the conflict, then run: git add .",
              mergeConflictScenario());
        }
        if (equalsIgnoreCaseExact(normalized, "git add .")) {
          state.getStagedFiles().add(state.getConflictedFile());
          return ok(
              "All conflicts marked as resolved (simulated).\nChanges staged: " + state.getConflictedFile(),
              "After resolving conflicts, `git add` tells Git the file is ready to be committed.",
              "Next: git commit -m \"merge: resolve conflict\"");
        }
        // allow commit to finish merge if conflict is staged
        if (normalizedLower.startsWith("git commit")) {
          if (!state.getStagedFiles().contains(state.getConflictedFile())) {
            return err(
                "error: cannot commit while conflict is unresolved",
                "You still have a conflicted file. Stage the resolved file(s) first.",
                "Next: git add .",
                mergeConflictScenario());
          }
          String msg = parseCommitMessage(command);
          if (msg == null || msg.trim().isEmpty()) {
            return err(
                "error: commit message cannot be empty",
                "A good message explains why the merge happened (and what was resolved).",
                "Example: git commit -m \"merge: resolve conflicts\"");
          }
          appendCommit(state.getCurrentBranch(), msg.trim());
          state.setMergeConflict(false);
          state.setConflictBranch(null);
          state.setConflictedFile(null);
          state.getStagedFiles().clear();
          return ok(
              "["
                  + state.getCurrentBranch()
                  + " "
                  + shortId(latestCommitId(state.getCurrentBranch()))
                  + "] "
                  + msg
                  + "\nMerge completed (simulated).",
              "This completes the merge by creating a new commit after conflicts are resolved.",
              "Next: git log");
        }

        return err(
            "error: merge conflict in progress",
            "When a conflict exists, focus on `git status`, resolve files, `git add`, then `git commit`.",
            "Next: git status",
            mergeConflictScenario());
      }

      // Core commands
      if (equalsIgnoreCaseExact(normalized, "git status")) {
        return ok(statusOutput(), "Shows the state of your working tree and staging area.", nextSuggestionFromStatus());
      }

      if (equalsIgnoreCaseExact(normalized, "git branch")) {
        return ok(branchOutput(), "Lists local branches. The `*` shows your current branch.", "Next: git checkout -b feature/demo");
      }

      if (equalsIgnoreCaseExact(normalized, "git add .")) {
        if (state.getWorkingTreeFiles().isEmpty()) {
          return ok(
              "Nothing to add (working tree clean)",
              "Stages changes so they will be included in the next commit.",
              "Next: git status");
        }
        state.getStagedFiles().addAll(state.getWorkingTreeFiles());
        return ok(
            "Changes staged (simulated):\n" + bulletList(state.getStagedFiles()),
            "Moves changes into the staging area so the next commit will include them.",
            "Next: git commit -m \"your message\"");
      }

      if (equalsIgnoreCaseExact(normalized, "git log")) {
        return ok(logOutput(), "Shows commit history for the current branch (simulated).", "Next: git status");
      }

      if (equalsIgnoreCaseExact(normalized, "git reset --hard")) {
        state.getStagedFiles().clear();
        state.getWorkingTreeFiles().clear();
        return ok(
            "HEAD is now at " + shortId(latestCommitId(state.getCurrentBranch())) + " (simulated)\nWorking tree clean.",
            "Discards local changes and resets staging + working tree to match the last commit (DANGEROUS in real Git).",
            "Next: git status");
      }

      if (equalsIgnoreCaseExact(normalized, "git push")) {
        return ok(
            "Pushed to origin/" + state.getCurrentBranch() + " (simulated)",
            "Uploads your local commits to a remote repository so others can fetch them.",
            "Next: git pull");
      }

      if (equalsIgnoreCaseExact(normalized, "git pull")) {
        return ok(
            "Already up to date. (simulated)",
            "Fetches remote changes and merges them into your current branch.",
            "Next: git log");
      }

      if (equalsIgnoreCaseExact(normalized, "git clone")) {
        state.reset();
        state.setInitialized(true);
        state.getBranches().add("main");
        state.setCurrentBranch("main");
        appendCommit("main", "initial commit from cloned repository");
        return ok(
            "Cloning into 'git-mastery-demo'...\nReceiving objects: 100% (simulated)",
            "Copies an existing remote repository to your local machine.",
            "Next: git status");
      }

      if (equalsIgnoreCaseExact(normalized, "git remote add origin")) {
        state.setRemoteConfigured(true);
        return ok(
            "Remote 'origin' added. (simulated)",
            "Adds a shortcut name (`origin`) for a remote repository URL.",
            "Next: git push origin main");
      }

      if (equalsIgnoreCaseExact(normalized, "git push origin main")) {
        return ok(
            "Pushed to origin/main (simulated)",
            "Pushes local `main` branch commits to the `origin` remote.",
            "Next: git pull origin main");
      }

      if (equalsIgnoreCaseExact(normalized, "git pull origin main")) {
        return ok(
            "From origin\n * branch            main -> FETCH_HEAD\nAlready up to date. (simulated)",
            "Fetches latest changes from `origin/main` and merges them into your local branch.",
            "Next: git log");
      }

      if (equalsIgnoreCaseExact(normalized, "git stash")) {
        state.getStagedFiles().clear();
        state.getWorkingTreeFiles().clear();
        return ok(
            "Saved working directory and index state WIP on " + state.getCurrentBranch() + " (simulated)",
            "Temporarily stores uncommitted changes so you can switch tasks safely.",
            "Next: git status");
      }

      if (equalsIgnoreCaseExact(normalized, "git rebase")) {
        return ok(
            "Current branch rebased successfully (simulated)",
            "Rebase reapplies your commits on top of another base commit to keep history linear.",
            "Next: git log");
      }

      // checkout -b <branch>
      Matcher mNew = CHECKOUT_NEW_PATTERN.matcher(normalized);
      if (mNew.matches()) {
        String newBranch = mNew.group(1);
        if (state.getBranches().contains(newBranch)) {
          return err(
              "fatal: a branch named '" + newBranch + "' already exists",
              "You tried to create a branch that already exists.",
              "Try: git checkout " + newBranch);
        }
        state.getBranches().add(newBranch);
        state.getCommitsByBranch().putIfAbsent(newBranch, new ArrayList<>(state.getCommitsByBranch().get(state.getCurrentBranch())));
        state.setCurrentBranch(newBranch);
        // introduce a "change" on new branch for educational flow
        state.getWorkingTreeFiles().add("src/App.jsx");
        return ok(
            "Switched to a new branch '" + newBranch + "'",
            "Creates a new branch and switches to it in one step.",
            "Next: git status");
      }

      // checkout <branch>
      Matcher mCo = CHECKOUT_PATTERN.matcher(normalized);
      if (mCo.matches() && !normalizedLower.startsWith("git checkout -b")) {
        String branch = mCo.group(1);
        if (!state.getBranches().contains(branch)) {
          return err(
              "error: pathspec '" + branch + "' did not match any file(s) known to git",
              "That branch doesn't exist in this repo (simulated).",
              "Try: git branch");
        }
        state.setCurrentBranch(branch);
        return ok(
            "Switched to branch '" + branch + "'",
            "Moves HEAD to the specified branch so new commits land there.",
            "Next: git status");
      }

      // merge <branch>
      Matcher mMerge = MERGE_PATTERN.matcher(normalized);
      if (mMerge.matches()) {
        String branch = mMerge.group(1);
        if (!state.getBranches().contains(branch)) {
          return err(
              "error: branch '" + branch + "' not found",
              "You can only merge branches that exist locally.",
              "Try: git branch");
        }
        if (branch.equals(state.getCurrentBranch())) {
          return err(
              "Already up to date.",
              "Merging a branch into itself is a no-op.",
              "Try: git branch");
        }

        // conflict heuristic: if both branches have different latest commits
        String currentTip = latestCommitId(state.getCurrentBranch());
        String incomingTip = latestCommitId(branch);
        boolean tipsDiffer = currentTip != null && incomingTip != null && !currentTip.equals(incomingTip);
        boolean hasWorkingChanges = !state.getWorkingTreeFiles().isEmpty() || !state.getStagedFiles().isEmpty();
        if (hasWorkingChanges) {
          return err(
              "error: cannot merge with local changes",
              "In real Git, you typically commit or stash changes before merging to avoid losing work.",
              "Next: git status");
        }

        if (tipsDiffer) {
          state.setMergeConflict(true);
          state.setConflictBranch(branch);
          state.setConflictedFile("src/App.jsx");
          return err(
              "Auto-merging " + state.getConflictedFile() + "\nCONFLICT (content): Merge conflict detected in file " + state.getConflictedFile(),
              "A merge conflict happens when Git can't automatically combine changes from two branches.",
              "Next: git status",
              mergeConflictScenario());
        }

        // fast-forward-ish simulation: copy commits and add merge commit
        List<SimulatorState.Commit> incoming = state.getCommitsByBranch().getOrDefault(branch, List.of());
        state.getCommitsByBranch().putIfAbsent(state.getCurrentBranch(), new ArrayList<>());
        state.getCommitsByBranch().get(state.getCurrentBranch()).clear();
        state.getCommitsByBranch().get(state.getCurrentBranch()).addAll(incoming);
        appendCommit(state.getCurrentBranch(), "merge: " + branch + " into " + state.getCurrentBranch());
        return ok(
            "Merged branch '" + branch + "' into '" + state.getCurrentBranch() + "' (simulated)",
            "Combines another branch into your current branch, integrating its commits.",
            "Next: git log");
      }
    }

    // commit (supports "msg" or 'msg')
    if (normalizedLower.startsWith("git commit")) {
      String msg = parseCommitMessage(command);
      synchronized (state) {
        if (msg == null || msg.trim().isEmpty()) {
          return err(
              "error: commit message cannot be empty",
              "A commit message explains what changed and why.",
              "Example: git commit -m \"add dashboard stats\"");
        }
        if (state.getStagedFiles().isEmpty()) {
          return err(
              "nothing to commit, working tree clean (simulated)",
              "Git only commits staged changes. Stage files first using `git add`.",
              "Next: git add .");
        }

        appendCommit(state.getCurrentBranch(), msg.trim());
        int files = state.getStagedFiles().size();
        state.getWorkingTreeFiles().removeAll(state.getStagedFiles());
        state.getStagedFiles().clear();

        return ok(
            "["
                + state.getCurrentBranch()
                + " "
                + shortId(latestCommitId(state.getCurrentBranch()))
                + "] "
                + msg.trim()
                + "\n "
                + files
                + " file(s) changed (simulated)",
            "Saves your staged changes into the project history with a message.",
            "Next: git log");
      }
    }

    return err(
        "error: unsupported command",
        "This simulator supports a safe subset of Git commands for learning.",
        "Try: git status");
  }

  private boolean equalsIgnoreCaseExact(String a, String b) {
    return a != null && b != null && a.equalsIgnoreCase(b);
  }

  private SimulateResponse ok(String output, String explanation, String nextSuggestion) {
    return SimulateResponse.builder()
        .success(true)
        .output(output)
        .explanation(explanation)
        .nextSuggestion(nextSuggestion)
        .build();
  }

  private SimulateResponse ok(String output, String explanation, String nextSuggestion, SimulateResponse.Scenario scenario) {
    return SimulateResponse.builder()
        .success(true)
        .output(output)
        .explanation(explanation)
        .nextSuggestion(nextSuggestion)
        .scenario(scenario)
        .build();
  }

  private SimulateResponse err(String output, String explanation, String nextSuggestion) {
    return SimulateResponse.builder()
        .success(false)
        .output(output)
        .explanation(explanation)
        .nextSuggestion(nextSuggestion)
        .build();
  }

  private SimulateResponse err(String output, String explanation, String nextSuggestion, SimulateResponse.Scenario scenario) {
    return SimulateResponse.builder()
        .success(false)
        .output(output)
        .explanation(explanation)
        .nextSuggestion(nextSuggestion)
        .scenario(scenario)
        .build();
  }

  private String statusOutput() {
    StringBuilder sb = new StringBuilder();
    sb.append("On branch ").append(state.getCurrentBranch()).append("\n");
    if (state.getStagedFiles().isEmpty() && state.getWorkingTreeFiles().isEmpty()) {
      sb.append("nothing to commit, working tree clean");
      return sb.toString();
    }
    if (!state.getStagedFiles().isEmpty()) {
      sb.append("Changes to be committed:\n");
      for (String f : state.getStagedFiles()) {
        sb.append("  modified: ").append(f).append("\n");
      }
    }
    if (!state.getWorkingTreeFiles().isEmpty()) {
      sb.append("Changes not staged for commit:\n");
      for (String f : state.getWorkingTreeFiles()) {
        if (!state.getStagedFiles().contains(f)) {
          sb.append("  modified: ").append(f).append("\n");
        }
      }
    }
    return sb.toString().trim();
  }

  private String conflictStatusOutput() {
    return "On branch "
        + state.getCurrentBranch()
        + "\nYou have unmerged paths.\n  (fix conflicts and run \"git commit\")\n\nUnmerged paths:\n  (use \"git add <file>...\" to mark resolution)\n\tboth modified:   "
        + state.getConflictedFile();
  }

  private String nextSuggestionFromStatus() {
    if (!state.getStagedFiles().isEmpty()) return "Next: git commit -m \"message\"";
    if (!state.getWorkingTreeFiles().isEmpty()) return "Next: git add .";
    return "Next: git checkout -b feature/demo";
  }

  private String branchOutput() {
    List<String> list = new ArrayList<>(state.getBranches());
    list.sort(Comparator.naturalOrder());
    StringBuilder sb = new StringBuilder();
    for (String b : list) {
      sb.append(b.equals(state.getCurrentBranch()) ? "* " : "  ").append(b).append("\n");
    }
    return sb.toString().trim();
  }

  private String logOutput() {
    List<SimulatorState.Commit> commits = state.getCommitsByBranch().getOrDefault(state.getCurrentBranch(), List.of());
    if (commits.isEmpty()) return "(no commits yet)";
    StringBuilder sb = new StringBuilder();
    for (int i = commits.size() - 1; i >= 0; i--) {
      SimulatorState.Commit c = commits.get(i);
      sb.append("commit ").append(c.getId()).append("\n");
      sb.append("Date:   ").append(c.getTimestamp()).append("\n\n");
      sb.append("    ").append(c.getMessage()).append("\n\n");
    }
    return sb.toString().trim();
  }

  private void appendCommit(String branch, String message) {
    state.getCommitsByBranch().putIfAbsent(branch, new ArrayList<>());
    String id = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    state.getCommitsByBranch().get(branch).add(
        SimulatorState.Commit.builder()
            .id(id)
            .branch(branch)
            .message(message)
            .timestamp(Instant.now())
            .build()
    );
  }

  private String latestCommitId(String branch) {
    List<SimulatorState.Commit> commits = state.getCommitsByBranch().get(branch);
    if (commits == null || commits.isEmpty()) return null;
    return commits.get(commits.size() - 1).getId();
  }

  private String shortId(String id) {
    if (id == null) return "0000000";
    return id.length() <= 7 ? id : id.substring(0, 7);
  }

  private String parseCommitMessage(String raw) {
    Matcher m = COMMIT_PATTERN.matcher(raw.trim());
    if (!m.matches()) return null;
    // group 2 = double-quoted content, group 3 = single-quoted content
    String msg = m.group(2) != null ? m.group(2) : m.group(3);
    return msg == null ? null : msg.trim();
  }

  private String bulletList(Iterable<String> items) {
    StringBuilder sb = new StringBuilder();
    for (String it : items) {
      sb.append("- ").append(it).append("\n");
    }
    return sb.toString().trim();
  }

  private SimulateResponse.Scenario mergeConflictScenario() {
    return SimulateResponse.Scenario.builder()
        .type("MERGE_CONFLICT")
        .title("Merge conflict detected")
        .steps(List.of(
            "Run `git status` to see which files are conflicted.",
            "Open the conflicted file and resolve the markers (<<<<<<, ======, >>>>>>).",
            "Stage the resolved file(s): `git add .`",
            "Finish the merge with a commit: `git commit -m \"merge: resolve conflict\"`"
        ))
        .build();
  }
}

