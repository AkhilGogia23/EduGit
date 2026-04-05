package com.gitmastery.progress;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
  Optional<UserProgress> findByEmail(String email);
}

