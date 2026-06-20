package com.smit.queuesystem.security;

import com.smit.queuesystem.dto.AuthRequest;
import com.smit.queuesystem.dto.AuthResponse;
import com.smit.queuesystem.repository.CounterRepository;
import com.smit.queuesystem.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final AppUserRepository repository;
    private final CounterRepository counterRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse authenticate(AuthRequest request) {
        String loginIdentifier = repository.findByEmail(request.getUsername())
                .map(user -> user.getUsername())
                .orElse(request.getUsername());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginIdentifier, request.getPassword())
        );
        var user = repository.findByUsername(loginIdentifier)
                .or(() -> repository.findByEmail(request.getUsername()))
                .orElseThrow();
        var counterId = counterRepository.findFirstByCurrentAgentId(user.getId()).map(counter -> counter.getId()).orElse(null);
        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .branchId(user.getBranch() != null ? user.getBranch().getId() : null)
                .counterId(counterId)
                .build();
    }
}
