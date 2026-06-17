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
          <p class="mt-6 text-xs font-semibold uppercase tracking-widest text-white/60">Multi-tenant Platform</p>
          <h1>One platform, many stores</h1>
          <p class="auth-brand-desc">
            Tenants apply to join, super admins review applications, and approved stores get their own workspace.
          </p>
          <ul class="auth-brand-features">
            <li>Apply as a new tenant business</li>
            <li>Super admin reviews all applications</li>
            <li>Approved tenants manage their own store</li>
          </ul>
        </div>
        <p class="auth-brand-footer">© 2026 BRIVIO</p>
      </aside>

      <section class="auth-form-panel" data-theme="brivio">
        <div class="auth-form-inner">
          <div>
            <h2>Sign in</h2>
            <p class="auth-subtitle mt-1">Super admin or approved tenant owner.</p>
          </div>

          @if (errorMessage()) {
            <div class="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
              {{ errorMessage() }}
            </div>
          }

          <form class="space-y-4" (ngSubmit)="onSubmit()">
            <div>
              <label class="field-label text-gray-600" for="email">Email address</label>
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
            <div>
              <label class="field-label text-gray-600" for="password">Password</label>
              <input
                id="password"
                class="input input-bordered w-full"
                [(ngModel)]="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            <button class="btn btn-primary w-full" [disabled]="loading()">
              {{ loading() ? 'Signing in…' : 'Sign in' }}
            </button>
          </form>

          <div class="auth-demo-box">
            <p>Demo accounts</p>
            <p class="mt-2 leading-relaxed">
              <code class="block">admin@brivio.com</code> — Super Admin
              <code class="block mt-1">hello@sugarblitz.com</code> — Tenant (Sugarblitz)
            </p>
          </div>

          <p class="text-sm text-gray-500">
            New business?
            <a routerLink="/register" class="link link-primary no-underline hover:underline">Apply as tenant</a>
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

  onSubmit(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    try {
      const user = this.authService.login(this.email, this.password);
      void this.authService.redirectByRole(user.role).finally(() => this.loading.set(false));
    } catch (error) {
      this.loading.set(false);
      this.errorMessage.set(error instanceof AuthError ? error.message : 'Unable to sign in.');
    }
  }
}
