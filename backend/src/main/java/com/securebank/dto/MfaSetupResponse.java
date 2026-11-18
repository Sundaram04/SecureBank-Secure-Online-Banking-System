package com.securebank.dto;

import java.util.List;

public class MfaSetupResponse {
    private String secretKey;
    private String qrCodeDataUri;
    private List<String> recoveryCodes;

    public MfaSetupResponse() {}

    public MfaSetupResponse(String secretKey, String qrCodeDataUri, List<String> recoveryCodes) {
        this.secretKey = secretKey;
        this.qrCodeDataUri = qrCodeDataUri;
        this.recoveryCodes = recoveryCodes;
    }

    public String getSecretKey() { return secretKey; }
    public void setSecretKey(String secretKey) { this.secretKey = secretKey; }

    public String getQrCodeDataUri() { return qrCodeDataUri; }
    public void setQrCodeDataUri(String qrCodeDataUri) { this.qrCodeDataUri = qrCodeDataUri; }

    public List<String> getRecoveryCodes() { return recoveryCodes; }
    public void setRecoveryCodes(List<String> recoveryCodes) { this.recoveryCodes = recoveryCodes; }
}
