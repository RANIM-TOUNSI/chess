package com.chess.backend.service;

import com.chess.backend.model.entity.Game;
import com.chess.backend.model.entity.Move;
import com.chess.backend.model.entity.User;

import java.util.List;

public interface GameService {
    Game createGame(User player1, User player2);
    Move saveMove(Move move);
    List<Move> getMoves(Long gameId);
}
