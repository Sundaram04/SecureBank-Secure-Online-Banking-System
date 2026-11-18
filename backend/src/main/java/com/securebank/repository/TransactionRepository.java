package com.securebank.repository;

import com.securebank.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByTransactionReference(String transactionReference);

    Optional<Transaction> findByIdempotencyKey(String idempotencyKey);

    @Query("SELECT t FROM Transaction t WHERE " +
           "(t.sourceAccount.user.id = :userId OR t.destinationAccount.user.id = :userId) " +
           "ORDER BY t.createdAt DESC")
    Page<Transaction> findUserTransactions(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE " +
           "(t.sourceAccount.user.id = :userId OR t.destinationAccount.user.id = :userId) " +
           "AND (:type IS NULL OR t.transactionType = :type) " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:startDate IS NULL OR t.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR t.createdAt <= :endDate) " +
           "ORDER BY t.createdAt DESC")
    Page<Transaction> filterUserTransactions(
        @Param("userId") Long userId,
        @Param("type") String type,
        @Param("status") String status,
        @Param("startDate") OffsetDateTime startDate,
        @Param("endDate") OffsetDateTime endDate,
        Pageable pageable
    );

    @Query("SELECT t FROM Transaction t WHERE t.id = :id AND " +
           "(t.sourceAccount.user.id = :userId OR t.destinationAccount.user.id = :userId)")
    Optional<Transaction> findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    @Query("SELECT t FROM Transaction t WHERE t.sourceAccount.id = :accountId OR t.destinationAccount.id = :accountId ORDER BY t.createdAt DESC")
    List<Transaction> findByAccountId(@Param("accountId") Long accountId);

    // Security Monitoring: Velocity check
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.sourceAccount.user.id = :userId AND t.createdAt >= :since")
    long countRecentTransfersByUser(@Param("userId") Long userId, @Param("since") OffsetDateTime since);

    // Security Monitoring: Daily volume check
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.sourceAccount.user.id = :userId AND t.status = 'COMPLETED' AND t.createdAt >= :since")
    BigDecimal sumRecentCompletedTransfersByUser(@Param("userId") Long userId, @Param("since") OffsetDateTime since);
}
