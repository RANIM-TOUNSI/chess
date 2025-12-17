package com.chess.backend.service;

import com.chess.backend.model.dto.LoginResponse;
import com.chess.backend.model.entity.User;

public interface UserService {
    User register(User user);

    LoginResponse login(String username, String password);

    java.util.List<User> getOnlineUsers();

    void logout(String username);
}
