package com.chess.backend.service.impl;

import com.chess.backend.model.entity.Move;
import com.chess.backend.repository.MoveRepository;
import com.chess.backend.service.MoveService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MoveServiceImpl implements MoveService {

    private final MoveRepository moveRepository;

    public MoveServiceImpl(MoveRepository moveRepository) {
        this.moveRepository = moveRepository;
    }

    @Override
    public Move saveMove(Move move) {
        return moveRepository.save(move);
    }

    @Override
    public List<Move> getMovesByGame(Long gameId) {
        return moveRepository.findByGameIdOrderByTimestampAsc(gameId);
    }
}
