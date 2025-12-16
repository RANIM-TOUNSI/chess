package com.chess.backend.service;

import com.chess.backend.model.entity.Move;

import java.util.List;

public interface MoveService {
    Move saveMove(Move move);
    List<Move> getMovesByGame(Long gameId);
}

