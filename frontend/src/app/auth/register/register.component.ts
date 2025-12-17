import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  username = '';
  password = '';
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) { }

  register() {
    console.log('Register clicked', this.username, this.password); // ✅ Debug click

    if (!this.username || !this.password) {
      this.errorMessage = 'Please fill in both fields';
      return;
    }

    this.successMessage = null;
    this.errorMessage = null;
    this.isLoading = true;

    this.authService.register(this.username, this.password).subscribe({
      next: (res) => {
        console.log('Backend response:', res); // ✅ Debug backend response
        this.isLoading = false;
        this.successMessage = 'Registration successful! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        console.error('Backend error:', err);
        this.isLoading = false;
        this.errorMessage = 'Registration failed. User might already exist.';
        alert('Registration Error: ' + (err.error?.message || err.message || 'Unknown error'));
      }
    });
  }
}
