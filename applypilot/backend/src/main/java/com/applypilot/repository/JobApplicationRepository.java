package com.applypilot.repository;

import com.applypilot.domain.ApplicationStatus;
import com.applypilot.domain.JobApplication;
import com.applypilot.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByUserOrderByCreatedAtDesc(User user);
    List<JobApplication> findByUserAndStatusOrderByCreatedAtDesc(User user, ApplicationStatus status);
    Optional<JobApplication> findByIdAndUser(Long id, User user);
    long countByUser(User user);
    long countByUserAndStatus(User user, ApplicationStatus status);
    long countByUserAndCreatedAtAfter(User user, java.time.Instant after);
    long countByUserAndFollowUpDateBetween(User user, LocalDate start, LocalDate end);
}
