package com.applypilot.repository;

import com.applypilot.domain.Resume;
import com.applypilot.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByUserOrderByUpdatedAtDesc(User user);
    Optional<Resume> findByIdAndUser(Long id, User user);
    List<Resume> findByUserAndPrimaryResumeTrue(User user);
    long countByUser(User user);
}
