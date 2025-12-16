package com.chess.backend.controller;

import com.chess.backend.model.entity.Game;
import com.chess.backend.model.entity.Move;
import com.chess.backend.model.entity.User;
import com.chess.backend.service.GameService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/games")
public class GameController {

    private final GameService gameService;

    private final SimpMessagingTemplate messagingTemplate;

    public GameController(GameService gameService, SimpMessagingTemplate messagingTemplate) {
        this.gameService = gameService;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping("/invite")
    public ResponseEntity<String> invite(@RequestParam Long from, @RequestParam Long to) {
        messagingTemplate.convertAndSend("/topic/invite/" + to, from);
        return ResponseEntity.ok("Invitation envoyée");
    }

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

    @PostMapping("/create")
    public ResponseEntity<Game> create(@RequestParam Long player1Id, @RequestParam Long player2Id) {
        Game game = gameService.createGame(
                new User() {
                    {
                        setId(player1Id);
                    }
                },
                new User() {
                    {
                        setId(player2Id);
                    }
                });
        // Notify both players that game started
        messagingTemplate.convertAndSend("/topic/game-start/" + player1Id, game.getId());
        messagingTemplate.convertAndSend("/topic/game-start/" + player2Id, game.getId());

        return ResponseEntity.ok(game);
    }
}
