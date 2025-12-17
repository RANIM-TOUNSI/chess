import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { WebSocketService } from '../../services/websocket.service';
import { InvitationService } from '../../services/invitation.service';
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
  loggingOut$ = this.authService.loggingOut$;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private webSocketService: WebSocketService,
    private invitationService: InvitationService,
    private router: Router
  ) { }

  ngOnInit() {
    this.currentUserId = this.authService.getUserId();
    this.username = this.authService.getUsername();
    this.fetchOnlinePlayers();

    // Re-initialize invitation service in case of page refresh/login mismatch
    this.invitationService.initialize();
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
    this.invitationService.invite(playerId);
  }

  logout() {
    console.log('Logging out...');
    this.authService.logout();
  }



  goToLogin() {
    console.log('Go to Login button clicked');
    this.router.navigate(['/login']);
  }
}
