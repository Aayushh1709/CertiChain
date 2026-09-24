package com.certichain.service;

import com.certichain.dto.AuthRequest;
import com.certichain.dto.AuthResponse;
import com.certichain.dto.SignupRequest;
import com.certichain.model.*;
import com.certichain.repository.InstitutionRepository;
import com.certichain.repository.UserRepository;
import com.certichain.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository, InstitutionRepository institutionRepository,
                       PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.institutionRepository = institutionRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!user.isActive()) {
            throw new RuntimeException("Account is deactivated");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        String institutionName = null;
        Long institutionId = null;
        if (user.getInstitution() != null) {
            institutionName = user.getInstitution().getName();
            institutionId = user.getInstitution().getId();
        }

        return new AuthResponse(token, user.getEmail(), user.getFullName(),
                user.getRole().name(), institutionId, institutionName);
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        Role role = Role.valueOf(request.getRole().toUpperCase());

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(role);

        Institution institution = null;

        if (role == Role.INSTITUTION_ADMIN) {
            // Create a new institution in PENDING status
            institution = new Institution();
            institution.setName(request.getInstitutionName());
            institution.setAccreditationId(request.getAccreditationId());
            institution.setContactEmail(request.getEmail());
            institution.setContactPhone(request.getContactPhone());
            institution.setAddress(request.getInstitutionAddress());
            institution.setWebsite(request.getWebsite());
            institution.setDescription(request.getDescription());
            institution.setStatus(InstitutionStatus.PENDING);
            institution.setWalletAddress("0x" + (UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "")).substring(0, 40));
            institution = institutionRepository.save(institution);

            user.setInstitution(institution);
        }

        user = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        String institutionName = institution != null ? institution.getName() : null;
        Long institutionId = institution != null ? institution.getId() : null;

        return new AuthResponse(token, user.getEmail(), user.getFullName(),
                user.getRole().name(), institutionId, institutionName);
    }
}
