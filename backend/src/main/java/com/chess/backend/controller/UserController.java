package com.chess.backend.controller;

import com.chess.backend.model.dto.LoginResponse;
import com.chess.backend.model.entity.User;
import com.chess.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        System.out.println("Register request for: " + user.getUsername());
        try {
            return userService.register(user);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody User user) {
        return userService.login(user.getUsername(), user.getPassword());
    }

    @GetMapping("/online")
    public java.util.List<User> getOnlineUsers() {
        return userService.getOnlineUsers();
    }
}
