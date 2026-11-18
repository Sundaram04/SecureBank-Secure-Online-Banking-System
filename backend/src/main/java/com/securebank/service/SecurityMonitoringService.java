package com.securebank.service;

import com.securebank.entity.SecurityEvent;
import com.securebank.entity.User;
import com.securebank.repository.SecurityEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SecurityMonitoringService {

    private static final Logger log = LoggerFactory.getLogger(SecurityMonitoringService.class);
    private final SecurityEventRepository securityEventRepository;

    public SecurityMonitoringService(SecurityEventRepository securityEventRepository) {
        this.securityEventRepository = securityEventRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordEvent(String eventType, String severity, User user, String username, String description) {
        try {
            SecurityEvent event = new SecurityEvent(
                    eventType,
                    severity,
                    user,
                    username != null ? username : (user != null ? user.getUsername() : "UNKNOWN"),
                    description
            );
            securityEventRepository.save(event);
            log.warn("[SECURITY MONITOR] event={} severity={} user={} details={}", eventType, severity, username, description);
        } catch (Exception e) {
            log.error("Failed to record security event", e);
        }
    }
}
