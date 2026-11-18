package com.securebank;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordEncoderUtilTest {
    @Test
    void printHashes() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
        System.out.println("HASH_ADMIN: " + encoder.encode("AdminPassword@123"));
        System.out.println("HASH_CUSTOMERA: " + encoder.encode("CustomerA@123"));
        System.out.println("HASH_CUSTOMERB: " + encoder.encode("CustomerB@123"));
    }
}
