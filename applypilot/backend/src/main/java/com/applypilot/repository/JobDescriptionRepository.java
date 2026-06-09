package com.applypilot.repository;

import com.applypilot.domain.JobDescription;
import com.applypilot.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobDescriptionRepository extends JpaRepository<JobDescription, Long> {
    List<JobDescription> findByUserOrderByUpdatedAtDesc(User user);
    Optional<JobDescription> findByIdAndUser(Long id, User user);
}
