import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvitationService } from '../../services/invitation.service';

@Component({
  selector: 'app-game-invitation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-wrapper">
      <!-- Bell Icon -->
      <div class="notification-icon" (click)="toggleInvitations()" [class.has-invite]="incomingInvitation">
        🔔
        <span *ngIf="incomingInvitation" class="badge">1</span>
      </div>

      <!-- Dropdown Board -->
      <div *ngIf="showInvitations && incomingInvitation" class="invitation-dropdown">
        <div class="dropdown-header">
           <span>Game Invitation</span>
           <span class="chess-piece">♟️</span>
        </div>
        
        <div class="dropdown-body">
             <div class="avatar-circle">{{ incomingInvitation.sender.username.charAt(0).toUpperCase() }}</div>
             <p><strong>{{ incomingInvitation.sender.username }}</strong> challenges you!</p>
             
             <div class="actions">
               <button (click)="accept()" class="btn-accept">Accept</button>
               <button (click)="refuse()" class="btn-refuse">Decline</button>
             </div>
        </div>
      </div>
      
      <!-- Empty State (Optional, logic implies we only show if invitation exists, but for UX maybe show 'No pending invites' if clicked? User requirement said "Clicking... shows pending invitations". Stick to simple.) -->
    </div>
  `,
  styles: [`
    .notification-wrapper {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      font-family: 'Inter', sans-serif;
    }

    /* --- Bell Icon --- */
    .notification-icon {
      background: rgba(30, 30, 40, 0.8);
      backdrop-filter: blur(10px);
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      transition: all 0.2s ease;
      position: relative;
    }

    .notification-icon:hover {
      transform: scale(1.05);
      background: rgba(40, 40, 50, 0.9);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .notification-icon.has-invite {
        animation: pulse 2s infinite;
        border-color: rgba(99, 102, 241, 0.5);
    }

    .badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: #ef4444;
      color: white;
      font-size: 0.75rem;
      font-weight: bold;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #1e1e28;
    }

    /* --- Dropdown --- */
    .invitation-dropdown {
      position: absolute;
      top: 60px;
      right: 0;
      width: 300px;
      background: rgba(24, 24, 32, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      animation: slideDown 0.2s ease-out;
      transform-origin: top right;
    }

    .dropdown-header {
      padding: 1rem;
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #94a3b8;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .dropdown-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .avatar-circle {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.2rem;
      color: white;
      margin-bottom: 1rem;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    p {
      color: #e2e8f0;
      margin-bottom: 1.5rem;
      line-height: 1.4;
    }

    strong {
      color: white;
    }

    .actions {
      display: flex;
      gap: 10px;
      width: 100%;
    }

    button {
      flex: 1;
      padding: 0.6rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: transform 0.1s;
    }

    .btn-accept {
      background: #22c55e;
      color: #fff;
    }
    
    .btn-accept:hover { background: #16a34a; }

    .btn-refuse {
      background: rgba(255, 255, 255, 0.05);
      color: #f87171;
      border: 1px solid rgba(248, 113, 113, 0.2);
    }
    
    .btn-refuse:hover { background: rgba(248, 113, 113, 0.1); }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
      100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
    }

    @keyframes slideDown {
      from { opacity: 0; transform: scale(0.95) translateY(-10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
  `]
})
export class GameInvitationComponent implements OnInit {
  incomingInvitation: any = null;
  showInvitations = false;

  constructor(public invitationService: InvitationService) { }

  ngOnInit() {
    this.invitationService.incomingInvite$.subscribe(invitation => {
      console.log('[GameInvitationComponent] Received invite update:', invitation);
      this.incomingInvitation = invitation;
      // Auto-open if you want, or just let the badge show. User asked for "Clicking... displays".
      // But maybe nice to auto-show a toast? The logic for toasts is already in the service.
      if (!invitation) {
        this.showInvitations = false;
      }
    });
  }

  toggleInvitations() {
    if (this.incomingInvitation) {
      this.showInvitations = !this.showInvitations;
    }
  }

  accept() {
    this.invitationService.accept();
    this.showInvitations = false;
  }

  refuse() {
    this.invitationService.refuse();
    this.showInvitations = false;
  }
}
