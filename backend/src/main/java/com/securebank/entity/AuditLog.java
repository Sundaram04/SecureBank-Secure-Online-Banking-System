package com.securebank.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "actor_username", nullable = false)
    private String actorUsername;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(name = "target_resource", length = 100)
    private String targetResource;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(nullable = false, length = 30)
    private String status; // SUCCESS, FAILURE, WARNING

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "correlation_id", length = 64)
    private String correlationId;

    @Column(nullable = false)
    private OffsetDateTime timestamp = OffsetDateTime.now();

    public AuditLog() {}

    public AuditLog(String actorUsername, String action, String targetResource, String ipAddress, String status, String details, String correlationId) {
        this.actorUsername = actorUsername;
        this.action = action;
        this.targetResource = targetResource;
        this.ipAddress = ipAddress;
        this.status = status;
        this.details = details;
        this.correlationId = correlationId;
        this.timestamp = OffsetDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getActorUsername() { return actorUsername; }
    public void setActorUsername(String actorUsername) { this.actorUsername = actorUsername; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getTargetResource() { return targetResource; }
    public void setTargetResource(String targetResource) { this.targetResource = targetResource; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public OffsetDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(OffsetDateTime timestamp) { this.timestamp = timestamp; }
}
