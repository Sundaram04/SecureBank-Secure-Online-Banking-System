package com.securebank.repository;

import com.securebank.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    List<UserSession> findByUserIdAndActiveTrue(Long userId);
    Optional<UserSession> findBySessionId(String sessionId);
    Optional<UserSession> findByIdAndUserId(Long id, Long userId);
}
