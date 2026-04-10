import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, User, Lock, Eye, EyeOff, LogIn } from 'lucide-angular';
import { AuthError } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="login-container animate-fade">
      <div class="main-card login-card">
        <div class="logo-container text-center">
          <img src="https://logos.automatizaciones-physis.cloud/uploads/1775070765_306318286_384550087203017_4093999974189775495_n.png" alt="Logo Bolsa de Café">
          <h2 class="physis-title">Panel Administrativo</h2>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="username">Usuario</label>
            <input 
              id="username" 
              type="text" 
              formControlName="username" 
              placeholder="Ingrese su usuario"
              class="form-control-physis"
              autocomplete="username"
            />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="input-with-icon">
              <input 
                id="password" 
                [type]="showPassword() ? 'text' : 'password'" 
                formControlName="password" 
                placeholder="Ingrese su contraseña"
                class="form-control-physis"
                autocomplete="current-password"
              />
              <button 
                type="button" 
                (click)="togglePassword()" 
                class="btn-toggle-eye"
                aria-label="Alternar visibilidad"
              >
                <lucide-icon [name]="showPassword() ? 'eye-off' : 'eye'" size="18"></lucide-icon>
              </button>
            </div>
          </div>

          <div *ngIf="authService.error() as authErr" class="alert-physis animate-fade">
            {{ authErr.message }}
          </div>

          <button 
            type="submit" 
            class="btn-primary full-width" 
            [disabled]="loginForm.invalid || authService.status() === 'authenticating'"
          >
            <span *ngIf="authService.status() !== 'authenticating'">
              Ingresar
            </span>
            <span *ngIf="authService.status() === 'authenticating'" class="spinner-container">
              <span class="spinner"></span>
              Cargando...
            </span>
          </button>
        </form>

        <div class="login-footer text-center">
          <p>&copy; {{ currentYear() }} Physis Informática SRL</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 1rem;
      background: #55c1e6;
      font-family: 'Roboto', "Helvetica Neue", sans-serif;
    }

    .main-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      width: 100%;
      max-width: 400px;
      padding: 2.5rem 2rem;
    }



    .logo-container {
      margin-bottom: 2rem;
    }

    .logo-container img {
      max-width: 154px;
      margin-bottom: 1.5rem;
    }

    .physis-title {
      color: #333333;
      margin: 0;
      font-size: 1.4rem;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      font-size: 0.9rem;
      color: #333333;
    }

    .form-control-physis {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 12px;
      font-size: 1rem;
      box-sizing: border-box;
    }

    .form-control-physis:focus {
      outline: none;
      border-color: #003366;
    }

    .input-with-icon {
      position: relative;
    }

    .btn-toggle-eye {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      cursor: pointer;
      color: #94a3b8;
      transition: color 0.2s;
    }

    .btn-toggle-eye:hover {
      color: var(--primary-physis);
    }


    .btn-primary {
      background-color: #003366;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }

    .full-width {
      width: 100%;
      height: 48px;
    }

    .alert-physis {
      padding: 12px;
      border-radius: 12px;
      background: #fef2f2;
      color: #b91c1c;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      text-align: center;
      border: 1px solid #fee2e2;
    }

    .spinner-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .login-footer {
      margin-top: 2rem;
      color: #666666;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .text-center { text-align: center; }
  `]



})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);

  readonly loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  readonly showPassword = signal(false);
  readonly currentYear = signal(new Date().getFullYear());

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login(username!, password!).subscribe({
        next: () => {
          // Success handled in service (navigation, etc)
        },
        error: (err: AuthError) => {
          console.error('Login failed', err);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
