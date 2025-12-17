package com.chess.backend.controller;

import com.chess.backend.model.entity.Move;
import com.chess.backend.service.GameService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/games")
@CrossOrigin(origins = "http://localhost:4200")
public class GameController {

    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    public GameController(GameService gameService,
            SimpMessagingTemplate messagingTemplate) {
        this.gameService = gameService;
        this.messagingTemplate = messagingTemplate;
    }

    // Invitation logic moved to InvitationController

    @PostMapping("/move")
    public ResponseEntity<Move> move(@RequestBody Move move) {
        Move savedMove = gameService.saveMove(move);
        messagingTemplate.convertAndSend("/topic/moves/" + move.getGame().getId(), savedMove);
        return ResponseEntity.ok(savedMove);
    }

    @GetMapping("/{id}/moves")
    public java.util.List<Move> getMoves(@PathVariable Long id) {
        return gameService.getMoves(id);
    }
}
