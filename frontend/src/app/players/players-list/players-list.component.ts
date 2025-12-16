import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { WebSocketService } from '../../services/websocket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-players-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './players-list.component.html',
  styleUrl: './players-list.component.css'
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
    // We add authorization header manually or via interceptor (assuming interceptor or simple test)
    // For this prototype we will assume token is handled by interceptor if added later, 
    // or we add a simple headers object here if AuthInterceptor is not yet present.
    // Let's check if we added an interceptor. I recall we didn't add one in the prompt.
    // So I should add headers here.
    const token = this.authService.getToken();
    const headers = { 'Authorization': `Bearer ${token}` };

    this.http.get<any[]>('http://localhost:8081/user/online', { headers }).subscribe({
      next: (data) => {
        this.players = data.filter(p => p.id !== this.currentUserId);
      },
      error: (err) => console.error(err)
    });
  }

  invite(playerId: number) {
    const token = this.authService.getToken();
    const headers = { 'Authorization': `Bearer ${token}` };
    // Send invitation request
    // We need a backend endpoint for this or just send via socket. 
    // The requirement says "Invite player", previously I saw GameController has /invite
    this.http.post(`http://localhost:8081/games/invite?from=${this.currentUserId}&to=${playerId}`, {}, { headers })
      .subscribe(() => alert('Invitation sent!'));
  }

  acceptInvitation(opponentId: number, myId: number) {
    const token = this.authService.getToken();
    const headers = { 'Authorization': `Bearer ${token}` };
    this.http.post<any>(`http://localhost:8081/games/create?player1Id=${opponentId}&player2Id=${myId}`, {}, { headers })
      .subscribe(game => {
        this.router.navigate(['/game', game.id]);
        // Also need to notify opponent to navigate. 
        // Ideally creation handles this broadcast or we assume socket does. 
        // For now let's stick to basics.
      });
  }
}
