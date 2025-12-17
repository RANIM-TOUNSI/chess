import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="toast-container">
      <div *ngFor="let toast of toastService.toasts$ | async" 
           class="toast" 
           [ngClass]="toast.type"
           (click)="toastService.remove(toast.id)">
        {{ toast.message }}
      </div>
    </div>
  `,
    styles: [`
    .toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .toast {
      padding: 12px 20px;
      border-radius: 6px;
      color: white;
      font-size: 0.9rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      cursor: pointer;
      animation: slideIn 0.3s ease;
      min-width: 200px;
    }
    .info { background: #3498db; }
    .success { background: #2ecc71; }
    .error { background: #e74c3c; }
    
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
    constructor(public toastService: ToastService) { }
}
