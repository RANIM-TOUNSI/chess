package com.chess.backend.service.impl;

import com.chess.backend.model.dto.LoginResponse;
import com.chess.backend.model.entity.User;
import com.chess.backend.repository.UserRepository;
import com.chess.backend.security.JwtUtil;
import com.chess.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Override
    public User register(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setOnline(false);
        return userRepository.save(user);
    }

    @Override
    public LoginResponse login(String username, String password) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setOnline(true);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername());

        return new LoginResponse(token, user.getId(), user.getUsername());
    }

    @Override
    public java.util.List<User> getOnlineUsers() {
        return userRepository.findByOnlineTrue();
    }
}
