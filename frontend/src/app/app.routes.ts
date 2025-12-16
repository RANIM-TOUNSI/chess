import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { PlayersListComponent } from './players/players-list/players-list.component';
import { BoardComponent } from './game/board/board.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/players', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'players', component: PlayersListComponent, canActivate: [authGuard] },
  { path: 'game/:id', component: BoardComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/login' }
];
