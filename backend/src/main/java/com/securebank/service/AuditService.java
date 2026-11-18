package com.securebank.service;

import com.securebank.entity.AuditLog;
import com.securebank.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);
    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logEvent(String actorUsername, String action, String targetResource, String ipAddress, String status, String details, String correlationId) {
        try {
            AuditLog auditLog = new AuditLog(
                    actorUsername != null ? actorUsername : "ANONYMOUS",
                    action,
                    targetResource,
                    ipAddress,
                    status,
                    details,
                    correlationId
            );
            auditLogRepository.save(auditLog);
            log.info("[AUDIT] actor={} action={} target={} status={} corrId={}", actorUsername, action, targetResource, status, correlationId);
        } catch (Exception e) {
            log.error("Failed to persist audit log", e);
        }
    }
}
