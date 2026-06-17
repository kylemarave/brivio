import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthError, AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-layout">
      <aside class="auth-brand">
        <div>
          <div class="auth-brand-logo">B</div>
          <p class="auth-brand-tag">Account recovery</p>
          <h1>Reset your password</h1>
          <p class="auth-brand-desc">
            Enter the email linked to your workspace. We'll send instructions to create a new password.
          </p>
        </div>
        <p class="auth-brand-footer">Need help? support@brivio.com</p>
      </aside>

      <section class="auth-form-panel">
        <div class="auth-form-card">
          <div>
            <h2>Forgot password</h2>
            <p class="auth-subtitle">We'll email you a secure reset link.</p>
          </div>

          @if (successMessage()) {
            <div class="auth-alert auth-alert-success">{{ successMessage() }}</div>
          }

          @if (errorMessage()) {
            <div class="auth-alert auth-alert-error">{{ errorMessage() }}</div>
          }

          <form class="space-y-4" (ngSubmit)="onSubmit()">
            <div class="auth-field">
              <label>Email address</label>
              <input class="input input-bordered w-full" [(ngModel)]="email" name="email" type="email" placeholder="you@company.com" required />
            </div>
            <button type="submit" class="btn-auth" [disabled]="loading()">
              {{ loading() ? 'Sending…' : 'Send reset link' }}
            </button>
          </form>

          <a routerLink="/login" class="page-back-link justify-center">← Back to sign in</a>
        </div>
      </section>
    </div>
  `,
})
export class ForgotPasswordComponent {
  email = '';
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  constructor(private readonly authService: AuthService) {}

  async onSubmit(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    try {
      const message = await this.authService.forgotPassword(this.email);
      this.successMessage.set(message);
    } catch (error) {
      this.errorMessage.set(error instanceof AuthError ? error.message : 'Unable to send reset link.');
    } finally {
      this.loading.set(false);
    }
  }
}
