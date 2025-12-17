import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameInvitationComponent } from './components/game-invitation/game-invitation.component';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GameInvitationComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';
}
