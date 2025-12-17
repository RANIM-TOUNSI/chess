package com.chess.backend.controller;

import com.chess.backend.model.entity.Game;
import com.chess.backend.model.entity.Invitation;
import com.chess.backend.model.entity.User;
import com.chess.backend.model.enums.InvitationStatus;
import com.chess.backend.service.GameService;
import com.chess.backend.repository.InvitationRepository;
import com.chess.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/invitations")
@CrossOrigin(origins = "http://localhost:4200")
public class InvitationController {

    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;
    private final InvitationRepository invitationRepository;

    public InvitationController(GameService gameService,
            SimpMessagingTemplate messagingTemplate,
            UserRepository userRepository,
            InvitationRepository invitationRepository) {
        this.gameService = gameService;
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
        this.invitationRepository = invitationRepository;
    }

    @PostMapping("/send")
    public ResponseEntity<?> send(@RequestParam Long from, @RequestParam Long to) {
        User sender = userRepository.findById(from)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(to)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Invitation invitation = new Invitation(sender, receiver);
        invitationRepository.save(invitation);

        // Notify receiver via WebSocket
        messagingTemplate.convertAndSend("/topic/invite/" + to, invitation);

        return ResponseEntity.ok(invitation);
    }

    @PostMapping("/accept")
    public ResponseEntity<?> accept(@RequestParam Long invitationId) {
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            return ResponseEntity.badRequest().body("Invitation is no longer pending");
        }

        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitationRepository.save(invitation);

        Game game = gameService.createGame(invitation.getSender(), invitation.getReceiver());

        // Notify both players about game start
        messagingTemplate.convertAndSend("/topic/game-start/" + invitation.getSender().getId(), game.getId());
        messagingTemplate.convertAndSend("/topic/game-start/" + invitation.getReceiver().getId(), game.getId());

        return ResponseEntity.ok(game);
    }

    @PostMapping("/decline")
    public ResponseEntity<?> decline(@RequestParam Long invitationId) {
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        invitation.setStatus(InvitationStatus.DECLINED);
        invitationRepository.save(invitation);

        // Notify sender that invitation was declined
        messagingTemplate.convertAndSend("/topic/refuse/" + invitation.getSender().getId(),
                invitation.getReceiver().getUsername());

        return ResponseEntity.ok("Invitation declined");
    }
}
