import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-layout">
      <aside class="auth-brand">
        <div>
          <div class="auth-brand-logo">B</div>
          <p class="mt-6 text-xs font-semibold uppercase tracking-widest text-white/60">Account recovery</p>
          <h1>We'll get you back in</h1>
          <p class="auth-brand-desc">
            Reset your password securely. You'll receive a link to create a new password for your workspace.
          </p>
        </div>
        <p class="auth-brand-footer">Need help? Contact support@brivio.com</p>
      </aside>

      <section class="auth-form-panel" data-theme="brivio">
        <div class="auth-form-inner">
          <div>
            <h2>Reset your password</h2>
            <p class="auth-subtitle mt-1">Enter the email associated with your account.</p>
          </div>

          <form class="space-y-4">
            <div>
              <label class="field-label text-gray-600">Email address</label>
              <input class="input input-bordered w-full" type="email" placeholder="you@company.com" />
            </div>
            <button type="button" class="btn btn-primary w-full">Send reset link (Mock)</button>
          </form>

          <a routerLink="/login" class="link link-primary text-sm no-underline hover:underline">← Back to sign in</a>
        </div>
      </section>
    </div>
  `,
})
export class ForgotPasswordComponent {}
