import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { WebSocketService } from '../../services/websocket.service';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-players-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.css']
})
export class PlayersListComponent implements OnInit {
  players: any[] = [];
  currentUserId: number | null = null;
  username: string | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private webSocketService: WebSocketService,
    private router: Router
  ) { }

  ngOnInit() {
    this.currentUserId = this.authService.getUserId();
    this.username = this.authService.getUsername();
    this.fetchOnlinePlayers();

    this.webSocketService.connect();

    if (this.currentUserId) {
      // Subscribe to invitations
      this.webSocketService.subscribe(`/topic/invite/${this.currentUserId}`, (message) => {
        if (confirm(`Player ${message.body} invited you to play. Accept?`)) {
          this.acceptInvitation(parseInt(message.body), this.currentUserId!);
        }
      });

      // Subscribe to game start
      this.webSocketService.subscribe(`/topic/game-start/${this.currentUserId}`, (message) => {
        const gameId = message.body;
        this.router.navigate(['/game', gameId]);
      });
    }
  }

  fetchOnlinePlayers() {
    this.http.get<any[]>(`${environment.apiUrl}/user/online`).subscribe({
      next: (data) => {
        this.players = data.filter(p => p.id !== this.currentUserId);
      },
      error: (err) => console.error('Failed to fetch online players:', err)
    });
  }

  invite(playerId: number) {
    console.log('Invite clicked for player:', playerId);
    this.http.post(`${environment.apiUrl}/games/invite?from=${this.currentUserId}&to=${playerId}`, {})
      .subscribe({
        next: () => alert('Invitation sent!'),
        error: (err) => console.error('Failed to send invitation:', err)
      });
  }

  logout() {
    console.log('Logging out...');
    this.authService.logout();
  }

  acceptInvitation(opponentId: number, myId: number) {
    this.http.post<any>(`${environment.apiUrl}/games/create?player1Id=${opponentId}&player2Id=${myId}`, {})
      .subscribe({
        next: (game) => {
          this.router.navigate(['/game', game.id]);
        },
        error: (err) => console.error('Failed to create game:', err)
      });
  }

  goToLogin() {
    console.log('Go to Login button clicked');
    this.router.navigate(['/login']);
  }
}
