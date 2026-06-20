package com.smit.queuesystem.bootstrap;

import com.smit.queuesystem.entity.AppUser;
import com.smit.queuesystem.enums.Role;
import com.smit.queuesystem.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminBootstrapSeeder implements CommandLineRunner {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        AppUser admin = userRepository.findByUsername("admin")
                .or(() -> userRepository.findByEmail("sonagarasmit2006@gmail.com"))
                .orElseGet(() -> AppUser.builder().username("admin").build());

        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("Smit@2006"));
        admin.setFullName("Platform Super Admin");
        admin.setEmail("sonagarasmit2006@gmail.com");
        admin.setPhone("+91-9000000000");
        admin.setEmailNotificationsEnabled(true);
        admin.setRole(Role.SUPER_ADMIN);
        admin.setOrganization(null);
        admin.setBranch(null);

        userRepository.save(admin);
    }
}
