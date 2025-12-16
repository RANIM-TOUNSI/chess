package com.chess.backend.controller;

import com.chess.backend.model.entity.Move;
import com.chess.backend.service.MoveService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/moves")
public class MoveController {

    private final MoveService moveService;

    private final SimpMessagingTemplate messagingTemplate;

    public MoveController(MoveService moveService, SimpMessagingTemplate messagingTemplate) {
        this.moveService = moveService;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping
    public ResponseEntity<Move> makeMove(@RequestBody Move move) {
        Move savedMove = moveService.saveMove(move);
        messagingTemplate.convertAndSend("/topic/moves/" + move.getGame().getId(), savedMove);
        return ResponseEntity.ok(savedMove);
    }

    @GetMapping("/game/{gameId}")
    public ResponseEntity<List<Move>> getMovesByGame(@PathVariable Long gameId) {
        List<Move> moves = moveService.getMovesByGame(gameId);
        return ResponseEntity.ok(moves);
    }
}
