package com.applypilot.repository;

import com.applypilot.domain.MatchReport;
import com.applypilot.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatchReportRepository extends JpaRepository<MatchReport, Long> {
    List<MatchReport> findByUserOrderByCreatedAtDesc(User user);
    Optional<MatchReport> findByIdAndUser(Long id, User user);
}
