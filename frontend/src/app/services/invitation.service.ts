import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { WebSocketService } from './websocket.service';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';

@Injectable({
    providedIn: 'root'
})
export class InvitationService {
    private incomingInviteSubject = new BehaviorSubject<any>(null);
    public incomingInvite$ = this.incomingInviteSubject.asObservable();

    private currentUserId: number | null = null;

    constructor(
        private http: HttpClient,
        private webSocketService: WebSocketService,
        private authService: AuthService,
        private router: Router,
        private toastService: ToastService
    ) {
        this.initialize();
    }

    initialize() {
        this.currentUserId = this.authService.getUserId();

        // Connect to WebSocket if not already connected (service handles idempotency usually, but let's be safe)
        this.webSocketService.connect();

        if (this.currentUserId) {
            console.log('[InvitationService] Initializing subscriptions for User:', this.currentUserId);

            // Subscribe to Invites
            this.webSocketService.subscribe(`/topic/invite/${this.currentUserId}`, (message) => {
                const invitation = JSON.parse(message.body);
                console.log('[InvitationService] Received invite:', invitation);
                this.toastService.show(`New invitation from ${invitation.sender.username}`, 'info');
                this.incomingInviteSubject.next(invitation);
            });

            // Subscribe to Refusals (Optional: could show a toast via another service)
            this.webSocketService.subscribe(`/topic/refuse/${this.currentUserId}`, (message) => {
                console.log('[InvitationService] Invite refused by:', message.body);
                this.toastService.show(`Player ${message.body} refused your invitation.`, 'error');
            });

            // Subscribe to Game Start
            this.webSocketService.subscribe(`/topic/game-start/${this.currentUserId}`, (message) => {
                console.log('[InvitationService] Game started:', message.body);
                this.toastService.show('Game started! Redirecting...', 'success');
                this.router.navigate(['/game', message.body]);
                this.incomingInviteSubject.next(null); // Clear invite state
            });
        } else {
            console.warn('[InvitationService] No User ID found. Cannot subscribe to invites.');
        }
    }

    invite(playerId: number) {
        if (!this.currentUserId) return;
        this.http.post(`${environment.apiUrl}/invitations/send?from=${this.currentUserId}&to=${playerId}`, {}, { responseType: 'text' })
            .subscribe({
                next: () => this.toastService.show('Invitation sent!', 'success'),
                error: (err) => {
                    console.error('Invite failed', err);
                    this.toastService.show('Failed to send invitation.', 'error');
                }
            });
    }

    accept() {
        const invitation = this.incomingInviteSubject.value;
        if (invitation) {
            this.http.post<any>(`${environment.apiUrl}/invitations/accept?invitationId=${invitation.id}`, {})
                .subscribe({
                    next: (game) => {
                        this.incomingInviteSubject.next(null);
                        console.log('Game created via accept:', game);
                    },
                    error: (err) => console.error('Accept failed', err)
                });
        }
    }

    refuse() {
        const invitation = this.incomingInviteSubject.value;
        if (invitation) {
            this.http.post(`${environment.apiUrl}/invitations/decline?invitationId=${invitation.id}`, {}, { responseType: 'text' })
                .subscribe(() => {
                    this.incomingInviteSubject.next(null);
                    this.toastService.show('Invitation declined.', 'info');
                });
        }
    }
}
