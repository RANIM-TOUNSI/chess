import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage: string | null = null;
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) { }

  login() {
    this.errorMessage = null;
    this.isLoading = true;

    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.router.navigate(['/players']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.errorMessage = 'Login failed. Please check your credentials or backend connection.';
      }
    });
  }

  demoLogin() {
    alert('Starting Demo Mode...');
    console.log('Demo Login Clicked!');
    this.isLoading = true;

    console.log('Setting tokens...');
    if (typeof localStorage !== 'undefined') {
      const guestId = Math.floor(Math.random() * 10000) + 1000;
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('userId', guestId.toString());
      localStorage.setItem('username', `Guest-${guestId}`);
    }

    this.isLoading = false;
    console.log('Navigating...');
    this.router.navigate(['/players'])
      .then(success => console.log('Navigation result:', success))
      .catch(err => console.error('Navigation error:', err));
  }
}
