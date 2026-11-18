package com.securebank.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class TotpServiceTest {

    private TotpService totpService;

    @BeforeEach
    void setUp() {
        totpService = new TotpService();
    }

    @Test
    @DisplayName("Should generate valid Base32 secret and QR code data URI")
    void testTotpGeneration() {
        String secret = totpService.generateSecret();
        assertNotNull(secret);
        assertTrue(secret.length() >= 16);

        String qrUri = totpService.generateQrCodeDataUri("test@securebank.com", secret);
        assertNotNull(qrUri);
        assertTrue(qrUri.startsWith("data:image/png;base64,"));
    }

    @Test
    @DisplayName("Should generate valid 8-character hyphenated recovery codes")
    void testRecoveryCodes() {
        List<String> codes = totpService.generateRecoveryCodes(8);
        assertEquals(8, codes.size());
        for (String code : codes) {
            assertEquals(9, code.length());
            assertEquals('-', code.charAt(4));
        }
    }
}
