import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { WebSocketService } from '../../services/websocket.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  gameId: number | null = null;
  board: string[][] = [];
  selectedCell: { row: number, col: number } | null = null;
  currentUserId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private webSocketService: WebSocketService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.currentUserId = this.authService.getUserId();
    this.gameId = Number(this.route.snapshot.paramMap.get('id'));
    this.initializeBoard();

    this.webSocketService.connect();

    if (this.gameId) {
      this.loadMoves();
      this.webSocketService.subscribe(`/topic/moves/${this.gameId}`, (message) => {
        const move = JSON.parse(message.body);
        this.updateBoard(move.fromRow, move.fromCol, move.toRow, move.toCol);
      });
    }
  }

  loadMoves() {
    this.http.get<any[]>(`${environment.apiUrl}/games/${this.gameId}/moves`).subscribe({
      next: (moves) => {
        moves.forEach(m => this.updateBoard(m.fromRow, m.fromCol, m.toRow, m.toCol));
      },
      error: (err) => console.error('Failed to load moves', err)
    });
  }

  initializeBoard() {
    // Simple initial chess setup
    // P = White Pawn, p = Black Pawn, etc.
    // Uppercase = White, Lowercase = Black
    this.board = [
      ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
      ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
  }

  onCellClick(row: number, col: number) {
    if (this.selectedCell) {
      // If already selected, try to move
      if (this.selectedCell.row === row && this.selectedCell.col === col) {
        this.selectedCell = null; // Deselect
      } else {
        this.makeMove(this.selectedCell.row, this.selectedCell.col, row, col);
        this.selectedCell = null;
      }
    } else {
      // Select piece if it belongs to current player (simplified: just if not empty)
      if (this.board[row][col] !== '') {
        this.selectedCell = { row, col };
      }
    }
  }

  makeMove(fromRow: number, fromCol: number, toRow: number, toCol: number) {
    // Optimistic update
    // this.updateBoard(fromRow, fromCol, toRow, toCol);

    // Send to server
    const move = {
      game: { id: this.gameId },
      player: { id: this.currentUserId },
      fromRow,
      fromCol,
      toRow,
      toCol,
      pieceType: this.board[fromRow][fromCol]
    };

    this.http.post(`${environment.apiUrl}/games/move`, move).subscribe({
      next: () => {
        // Success, wait for socket to confirm or simple verify
      },
      error: (err) => console.error('Move failed', err)
    });
  }

  updateBoard(fromRow: number, fromCol: number, toRow: number, toCol: number) {
    this.board[toRow][toCol] = this.board[fromRow][fromCol];
    this.board[fromRow][fromCol] = '';
  }

  getPieceSymbol(code: string): string {
    const symbols: { [key: string]: string } = {
      'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔',
      'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚'
    };
    return symbols[code] || '';
  }
}
