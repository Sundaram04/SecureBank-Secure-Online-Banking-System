package com.securebank.repository;

import com.securebank.entity.MfaSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MfaSettingRepository extends JpaRepository<MfaSetting, Long> {
    Optional<MfaSetting> findByUserId(Long userId);
}
