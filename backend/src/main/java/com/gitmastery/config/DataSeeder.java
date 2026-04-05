package com.gitmastery.config;

import com.gitmastery.lesson.Lesson;
import com.gitmastery.lesson.LessonRepository;
import com.gitmastery.quiz.Question;
import com.gitmastery.quiz.QuestionRepository;
import com.gitmastery.topic.Topic;
import com.gitmastery.topic.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {
  private final TopicRepository topicRepository;
  private final QuestionRepository questionRepository;
  private final LessonRepository lessonRepository;

  @Bean
  CommandLineRunner seedData() {
    return args -> {
      if (topicRepository.count() == 0) {
        topicRepository.saveAll(List.of(
            Topic.builder().title("Git Basics").description("Learn init, status, add, and commit fundamentals.").build(),
            Topic.builder().title("Branching").description("Understand branches, switching, and listing branches.").build(),
            Topic.builder().title("Staging Area").description("What gets staged and why it matters before commits.").build(),
            Topic.builder().title("Commit Messages").description("Write meaningful messages and use -m correctly.").build(),
            Topic.builder().title("Daily Workflow").description("A simple workflow to practice Git every day.").build()
        ));
      }

      if (questionRepository.count() == 0) {
        questionRepository.saveAll(List.of(
            Question.builder()
                .question("What command initializes a new Git repository?")
                .options(List.of("git start", "git init", "git create", "git new"))
                .correctAnswer("git init")
                .build(),
            Question.builder()
                .question("Which command stages all changes in the current directory?")
                .options(List.of("git add .", "git stage *", "git commit -a", "git push"))
                .correctAnswer("git add .")
                .build(),
            Question.builder()
                .question("How do you create a commit with a message?")
                .options(List.of("git commit \"message\"", "git commit -m \"message\"", "git add -m \"message\"", "git message -m \"message\""))
                .correctAnswer("git commit -m \"message\"")
                .build(),
            Question.builder()
                .question("Which command lists local branches?")
                .options(List.of("git branch", "git branches", "git list-branch", "git show-branches"))
                .correctAnswer("git branch")
                .build()
        ));
      }

      if (lessonRepository.count() == 0) {
        lessonRepository.saveAll(List.of(
            Lesson.builder().title("What is Git").level("Beginner")
                .content("Git is a version control system. It helps you track changes in code over time.\n\nExample:\n- You edit a file\n- You save a snapshot with a commit\n- You can later view or restore past versions using git log and checkout.")
                .build(),
            Lesson.builder().title("Git vs GitHub").level("Beginner")
                .content("Git is the tool on your machine. GitHub is a cloud platform that hosts Git repositories.\n\nExample:\n- Use git commit locally\n- Use git push to send commits to GitHub")
                .build(),
            Lesson.builder().title("git init").level("Beginner")
                .content("git init creates a new repository in your project folder.\n\nExample:\n- mkdir demo\n- cd demo\n- git init")
                .build(),
            Lesson.builder().title("git add & git commit").level("Beginner")
                .content("git add stages changes. git commit saves staged changes with a message.\n\nExample:\n- git add .\n- git commit -m \"add login form\"")
                .build(),
            Lesson.builder().title("Branching").level("Intermediate")
                .content("Branches let you work on features safely without changing main immediately.\n\nExample:\n- git checkout -b feature/auth\n- make changes\n- git commit -m \"implement auth\"")
                .build(),
            Lesson.builder().title("Merging").level("Intermediate")
                .content("Merging combines changes from one branch into another.\n\nExample:\n- git checkout main\n- git merge feature/auth")
                .build(),
            Lesson.builder().title("Merge Conflicts").level("Intermediate")
                .content("Conflicts happen when two branches edit the same area differently.\n\nResolve flow:\n1) open conflicted file\n2) keep correct code\n3) git add .\n4) git commit -m \"resolve conflict\"")
                .build(),
            Lesson.builder().title("Git Workflow (Real-world)").level("Intermediate")
                .content("Typical team flow: create branch, commit often, push branch, open PR, merge to main.\n\nExample:\n- git checkout -b feature/ui\n- git add . && git commit -m \"ui improvements\"\n- git push origin feature/ui")
                .build()
        ));
      }
    };
  }
}

