package com.securebank.repository;

import com.securebank.entity.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, Long> {
    List<LedgerEntry> findByTransactionId(Long transactionId);
    List<LedgerEntry> findByAccountIdOrderByCreatedAtDesc(Long accountId);
}
