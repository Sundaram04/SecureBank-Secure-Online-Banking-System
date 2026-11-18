package com.securebank.controller;

import com.securebank.dto.ApiResponse;
import com.securebank.dto.BeneficiaryDto;
import com.securebank.dto.BeneficiaryRequest;
import com.securebank.service.BeneficiaryService;
import com.securebank.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beneficiaries")
@PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    public BeneficiaryController(BeneficiaryService beneficiaryService) {
        this.beneficiaryService = beneficiaryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BeneficiaryDto>>> getBeneficiaries() {
        String username = SecurityUtils.getCurrentUsername();
        List<BeneficiaryDto> beneficiaries = beneficiaryService.getUserBeneficiaries(username);
        return ResponseEntity.ok(ApiResponse.success(beneficiaries));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BeneficiaryDto>> addBeneficiary(
            @Valid @RequestBody BeneficiaryRequest request
    ) {
        String username = SecurityUtils.getCurrentUsername();
        BeneficiaryDto beneficiary = beneficiaryService.addBeneficiary(username, request);
        return ResponseEntity.ok(ApiResponse.success("Beneficiary added successfully", beneficiary));
    }

    @DeleteMapping("/{beneficiaryId}")
    public ResponseEntity<ApiResponse<Void>> deleteBeneficiary(@PathVariable Long beneficiaryId) {
        String username = SecurityUtils.getCurrentUsername();
        beneficiaryService.deleteBeneficiary(beneficiaryId, username);
        return ResponseEntity.ok(ApiResponse.success("Beneficiary removed successfully", null));
    }
}
