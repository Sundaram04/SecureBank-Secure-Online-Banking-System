package com.securebank.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public boolean tryConsume(String key, long capacity, Duration refillDuration) {
        Bucket bucket = buckets.computeIfAbsent(key, k -> Bucket.builder()
                .addLimit(Bandwidth.classic(capacity, Refill.greedy(capacity, refillDuration)))
                .build());
        return bucket.tryConsume(1);
    }

    public boolean tryConsumeLogin(String ipOrEmail) {
        // 5 login attempts per minute
        return tryConsume("LOGIN:" + ipOrEmail, 5, Duration.ofMinutes(1));
    }

    public boolean tryConsumePasswordReset(String ipOrEmail) {
        // 3 reset requests per 15 minutes
        return tryConsume("PWD_RESET:" + ipOrEmail, 3, Duration.ofMinutes(15));
    }

    public boolean tryConsumeTransfer(Long userId) {
        // 10 transfers per minute
        return tryConsume("TRANSFER:" + userId, 10, Duration.ofMinutes(1));
    }

    public boolean tryConsumeBeneficiary(Long userId) {
        // 10 beneficiary operations per minute
        return tryConsume("BENEFICIARY:" + userId, 10, Duration.ofMinutes(1));
    }
}
