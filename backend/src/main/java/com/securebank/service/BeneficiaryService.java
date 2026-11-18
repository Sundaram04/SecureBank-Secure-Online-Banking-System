package com.securebank.service;

import com.securebank.dto.BeneficiaryDto;
import com.securebank.dto.BeneficiaryRequest;
import com.securebank.entity.BankAccount;
import com.securebank.entity.Beneficiary;
import com.securebank.entity.User;
import com.securebank.exception.DuplicateResourceException;
import com.securebank.exception.ResourceNotFoundException;
import com.securebank.exception.UnauthorizedAccessException;
import com.securebank.repository.BankAccountRepository;
import com.securebank.repository.BeneficiaryRepository;
import com.securebank.repository.UserRepository;
import com.securebank.security.RateLimiterService;
import com.securebank.util.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final BankAccountRepository bankAccountRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final RateLimiterService rateLimiterService;

    public BeneficiaryService(
            BeneficiaryRepository beneficiaryRepository,
            BankAccountRepository bankAccountRepository,
            UserRepository userRepository,
            AuditService auditService,
            RateLimiterService rateLimiterService
    ) {
        this.beneficiaryRepository = beneficiaryRepository;
        this.bankAccountRepository = bankAccountRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.rateLimiterService = rateLimiterService;
    }

    @Transactional(readOnly = true)
    public List<BeneficiaryDto> getUserBeneficiaries(String username) {
        User user = getUser(username);
        return beneficiaryRepository.findByUserId(user.getId()).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public BeneficiaryDto addBeneficiary(String username, BeneficiaryRequest request) {
        User user = getUser(username);

        if (!rateLimiterService.tryConsumeBeneficiary(user.getId())) {
            throw new RuntimeException("Too many beneficiary requests. Please wait a minute.");
        }

        String targetAccNumber = request.getBeneficiaryAccountNumber().trim();

        // 1. Verify that destination account actually exists in SecureBank
        BankAccount destinationAccount = bankAccountRepository.findByAccountNumber(targetAccNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Target bank account '" + targetAccNumber + "' does not exist."));

        // 2. Prevent adding own account as beneficiary
        if (destinationAccount.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You cannot add your own bank account as a beneficiary.");
        }

        // 3. Prevent duplicate beneficiary
        if (beneficiaryRepository.existsByUserIdAndBeneficiaryAccountNumber(user.getId(), targetAccNumber)) {
            throw new DuplicateResourceException("This account is already registered in your beneficiaries list.");
        }

        Beneficiary beneficiary = new Beneficiary();
        beneficiary.setUser(user);
        beneficiary.setBeneficiaryAccountNumber(targetAccNumber);
        beneficiary.setBeneficiaryName(request.getBeneficiaryName().trim());
        beneficiary.setBankName(request.getBankName() != null ? request.getBankName().trim() : "SecureBank");
        beneficiary.setEmail(request.getEmail() != null ? request.getEmail().trim() : destinationAccount.getUser().getUsername());
        beneficiary.setNickname(request.getNickname() != null ? request.getNickname().trim() : request.getBeneficiaryName().trim());

        Beneficiary saved = beneficiaryRepository.save(beneficiary);

        auditService.logEvent(username, "BENEFICIARY_ADDED", "BENEFICIARY:" + saved.getId(), "127.0.0.1", "SUCCESS",
                "Added beneficiary: " + targetAccNumber, null);

        return toDto(saved);
    }

    @Transactional
    public void deleteBeneficiary(Long beneficiaryId, String username) {
        User user = getUser(username);

        Beneficiary beneficiary = beneficiaryRepository.findById(beneficiaryId)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary with ID " + beneficiaryId + " not found."));

        // IDOR Check
        if (!beneficiary.getUser().getId().equals(user.getId())) {
            auditService.logEvent(username, "UNAUTHORIZED_BENEFICIARY_DELETE", "BENEFICIARY:" + beneficiaryId, "127.0.0.1", "FAILURE", "IDOR attempt on beneficiary delete", null);
            throw new UnauthorizedAccessException("You are not authorized to delete this beneficiary.");
        }

        beneficiaryRepository.delete(beneficiary);
        auditService.logEvent(username, "BENEFICIARY_DELETED", "BENEFICIARY:" + beneficiaryId, "127.0.0.1", "SUCCESS",
                "Removed beneficiary: " + beneficiary.getBeneficiaryAccountNumber(), null);
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    private BeneficiaryDto toDto(Beneficiary b) {
        BeneficiaryDto dto = new BeneficiaryDto();
        dto.setId(b.getId());
        dto.setBeneficiaryAccountNumber(b.getBeneficiaryAccountNumber());
        dto.setMaskedAccountNumber(SecurityUtils.maskAccountNumber(b.getBeneficiaryAccountNumber()));
        dto.setBeneficiaryName(b.getBeneficiaryName());
        dto.setBankName(b.getBankName());
        dto.setEmail(b.getEmail());
        dto.setNickname(b.getNickname());
        dto.setCreatedAt(b.getCreatedAt());
        return dto;
    }
}
