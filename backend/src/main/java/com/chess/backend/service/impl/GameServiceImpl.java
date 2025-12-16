package com.chess.backend.service.impl;

import com.chess.backend.model.entity.Game;
import com.chess.backend.model.entity.Move;
import com.chess.backend.model.entity.User;
import com.chess.backend.repository.GameRepository;
import com.chess.backend.repository.MoveRepository;
import com.chess.backend.service.GameService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GameServiceImpl implements GameService {


    private final GameRepository gameRepository;

    private final MoveRepository moveRepository;

    public GameServiceImpl(GameRepository gameRepository, MoveRepository moveRepository) {
        this.gameRepository = gameRepository;
        this.moveRepository = moveRepository;
    }

    @Override
    public Game createGame(User player1, User player2) {
        Game game = new Game();
        game.setPlayer1(player1);
        game.setPlayer2(player2);
        game.setStatus("EN_COURS");
        return gameRepository.save(game);
    }

    @Override
    public Move saveMove(Move move) {
        return moveRepository.save(move);
    }

    @Override
    public List<Move> getMoves(Long gameId) {
        return moveRepository.findByGameIdOrderByTimestampAsc(gameId);
    }
}

