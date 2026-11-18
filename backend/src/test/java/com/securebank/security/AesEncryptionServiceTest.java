package com.securebank.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class AesEncryptionServiceTest {

    private AesEncryptionService aesService;

    @BeforeEach
    void setUp() {
        // 256-bit test key (64 hex characters)
        String hexKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
        aesService = new AesEncryptionService(hexKey);
    }

    @Test
    @DisplayName("Should encrypt and decrypt sensitive data accurately using AES-256-GCM")
    void testEncryptionDecryptionRoundtrip() {
        String sensitiveSecret = "JBSWY3DPEHPK3PXP";
        String cipherText = aesService.encrypt(sensitiveSecret);

        assertNotNull(cipherText);
        assertNotEquals(sensitiveSecret, cipherText);

        String decrypted = aesService.decrypt(cipherText);
        assertEquals(sensitiveSecret, decrypted);
    }

    @Test
    @DisplayName("Should generate different ciphertexts for the same plaintext due to random 96-bit IV")
    void testIvRandomness() {
        String secret = "TEST_SECRET_KEY";
        String cipherText1 = aesService.encrypt(secret);
        String cipherText2 = aesService.encrypt(secret);

        assertNotEquals(cipherText1, cipherText2, "Two encryptions of the same plaintext must produce different ciphertexts (no IV reuse)");
        assertEquals(secret, aesService.decrypt(cipherText1));
        assertEquals(secret, aesService.decrypt(cipherText2));
    }
}
