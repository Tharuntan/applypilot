package com.applypilot.repository;

import com.applypilot.domain.GeneratedDocument;
import com.applypilot.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GeneratedDocumentRepository extends JpaRepository<GeneratedDocument, Long> {
    List<GeneratedDocument> findByUserOrderByCreatedAtDesc(User user);
    Optional<GeneratedDocument> findByIdAndUser(Long id, User user);
}
