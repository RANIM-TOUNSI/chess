package com.chess.backend.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import com.chess.backend.repository.UserRepository;
import com.chess.backend.model.dto.UserDto;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import java.security.Principal;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messagingTemplate;
    private final UserRepository userRepository;
    // Thread-safe set to store connected usernames
    private final Set<String> onlineUsers = ConcurrentHashMap.newKeySet();

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal user = headerAccessor.getUser();

        if (user != null) {
            String username = user.getName();
            onlineUsers.add(username);
            log.info("User Connected: {}", username);
            broadcastOnlineUsers();
        } else {
            log.warn("Anonymous user connected");
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal user = headerAccessor.getUser();

        if (user != null) {
            String username = user.getName();
            onlineUsers.remove(username);
            log.info("User Disconnected: {}", username);
            broadcastOnlineUsers();
        }
    }

    private void broadcastOnlineUsers() {
        // Fetch details for all connected users
        List<UserDto> activePlayers = onlineUsers.stream()
                .map(username -> userRepository.findByUsername(username).orElse(null))
                .filter(Objects::nonNull)
                .map(user -> new UserDto(user.getId(), user.getUsername(), true))
                .collect(Collectors.toList());

        messagingTemplate.convertAndSend("/topic/players", activePlayers);
    }
}
