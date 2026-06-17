import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthError, AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-layout">
      <aside class="auth-brand">
        <div>
          <div class="auth-brand-logo">B</div>
          <p class="auth-brand-tag">Multi-tenant Platform</p>
          <h1>Run every store from one place</h1>
          <p class="auth-brand-desc">
            Brivio connects coffee shops and retail tenants under one platform. Super admins review applications; approved owners get a full workspace.
          </p>
          <ul class="auth-brand-features">
            <li>Tenant onboarding & approval workflow</li>
            <li>Isolated store catalog, orders & ops</li>
            <li>Real-time workspace for each business</li>
          </ul>
        </div>
        <p class="auth-brand-footer">© 2026 BRIVIO · Built for growing retail brands</p>
      </aside>

      <section class="auth-form-panel">
        <div class="auth-form-card">
          <div>
            <h2>Welcome back</h2>
            <p class="auth-subtitle">Sign in as super admin or tenant owner.</p>
          </div>

          @if (errorMessage()) {
            <div class="auth-alert auth-alert-error">{{ errorMessage() }}</div>
          }

          <form class="space-y-4" (ngSubmit)="onSubmit()">
            <div class="auth-field">
              <label for="email">Email address</label>
              <input
                id="email"
                class="input input-bordered w-full"
                [(ngModel)]="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                required
              />
            </div>
            <div class="auth-field">
              <div class="flex items-center justify-between">
                <label for="password">Password</label>
                <a routerLink="/forgot-password" class="text-xs font-medium text-primary hover:underline">Forgot?</a>
              </div>
              <input
                id="password"
                class="input input-bordered w-full"
                [(ngModel)]="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>
            <button class="btn-auth" [disabled]="loading()">
              {{ loading() ? 'Signing in…' : 'Sign in' }}
            </button>
          </form>

          <div class="auth-demo-box">
            <p class="auth-demo-box-title">Demo accounts</p>
            <div class="auth-demo-pill">
              <span><code>admin@brivio.com</code> Super Admin</span>
              <span><code>hello@sugarblitz.com</code> Sugarblitz Owner</span>
            </div>
          </div>

          <p class="auth-footer-text">
            New business?
            <a routerLink="/register" class="font-semibold text-primary hover:underline">Apply as tenant</a>
          </p>
        </div>
      </section>
    </div>
  `,
})
export class LoginComponent {
  email = 'hello@sugarblitz.com';
  password = 'password';
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  constructor(private readonly authService: AuthService) {}

  async onSubmit(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');
    try {
      const user = await this.authService.login(this.email, this.password);
      await this.authService.redirectByRole(user.role);
    } catch (error) {
      this.errorMessage.set(error instanceof AuthError ? error.message : 'Unable to sign in.');
    } finally {
      this.loading.set(false);
    }
  }
}
