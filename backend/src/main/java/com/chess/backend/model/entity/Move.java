package com.chess.backend.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Move {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Game game;

    private int fromRow;
    private int fromCol;
    private int toRow;
    private int toCol;

    @Column(name = "piece_type")
    private String pieceType;

    private LocalDateTime timestamp = LocalDateTime.now();

    // getters / setters
}
