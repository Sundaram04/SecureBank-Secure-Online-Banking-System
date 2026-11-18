package com.securebank.repository;

import com.securebank.entity.LoginAttempt;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, Long> {
    List<LoginAttempt> findByEmailOrderByAttemptTimeDesc(String email, Pageable pageable);

    @Query("SELECT COUNT(l) FROM LoginAttempt l WHERE LOWER(l.email) = LOWER(:email) AND l.success = false AND l.attemptTime >= :since")
    long countRecentFailedAttempts(@Param("email") String email, @Param("since") OffsetDateTime since);
}
