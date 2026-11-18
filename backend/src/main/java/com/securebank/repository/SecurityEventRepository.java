package com.securebank.repository;

import com.securebank.entity.SecurityEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecurityEventRepository extends JpaRepository<SecurityEvent, Long> {
    Page<SecurityEvent> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT s FROM SecurityEvent s WHERE " +
           "(:status IS NULL OR s.reviewStatus = :status) AND " +
           "(:severity IS NULL OR s.severity = :severity) " +
           "ORDER BY s.createdAt DESC")
    Page<SecurityEvent> searchEvents(
        @Param("status") String status,
        @Param("severity") String severity,
        Pageable pageable
    );

    List<SecurityEvent> findTop10ByOrderByCreatedAtDesc();

    long countByReviewStatus(String reviewStatus);
}
