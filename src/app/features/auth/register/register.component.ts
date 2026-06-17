import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthError, AuthService } from '../../../core/auth/auth.service';
import { SubscriptionPlan } from '../../../core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-layout">
      <aside class="auth-brand">
        <div>
          <div class="auth-brand-logo">B</div>
          <p class="auth-brand-tag">Tenant Application</p>
          <h1>Join the Brivio platform</h1>
          <p class="auth-brand-desc">
            Submit your coffee shop or retail business details. A super admin reviews every application before your store goes live.
          </p>
          <ul class="auth-brand-features">
            <li>Full store workspace after approval</li>
            <li>Catalog, orders, inventory & more</li>
            <li>Typical review within 1–2 business days</li>
          </ul>
        </div>
        <p class="auth-brand-footer">Questions? support@brivio.com</p>
      </aside>

      <section class="auth-form-panel">
        <div class="auth-form-card">
          @if (submitted()) {
            <div class="space-y-5 text-center">
              <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success/15 text-2xl text-success">✓</div>
              <div>
                <h2>Application submitted</h2>
                <p class="auth-subtitle mt-2">We'll notify you once a super admin approves your store.</p>
              </div>
              <a routerLink="/login" class="btn-auth">Back to sign in</a>
            </div>
          } @else {
            <div>
              <h2>Apply as tenant</h2>
              <p class="auth-subtitle">Tell us about your business.</p>
            </div>

            @if (errorMessage()) {
              <div class="auth-alert auth-alert-error">{{ errorMessage() }}</div>
            }

            <form class="space-y-4" (ngSubmit)="onSubmit()">
              <div class="auth-field">
                <label>Business name</label>
                <input class="input input-bordered w-full" [(ngModel)]="businessName" name="businessName" required placeholder="Sugarblitz Coffee" />
              </div>
              <div class="auth-field">
                <label>Contact email</label>
                <input class="input input-bordered w-full" [(ngModel)]="email" name="email" type="email" required placeholder="owner@store.com" />
              </div>
              <div class="auth-field">
                <label>Phone</label>
                <input class="input input-bordered w-full" [(ngModel)]="phone" name="phone" required placeholder="+63 912 345 6789" />
              </div>
              <div class="auth-field">
                <label>Subscription plan</label>
                <select class="select select-bordered w-full" [(ngModel)]="plan" name="plan">
                  <option value="STARTER">Starter — $29/mo</option>
                  <option value="GROWTH">Growth — $79/mo</option>
                  <option value="PREMIUM">Premium — $149/mo</option>
                </select>
              </div>
              <button type="submit" class="btn-auth" [disabled]="submitting()">
                {{ submitting() ? 'Submitting…' : 'Submit application' }}
              </button>
            </form>

            <p class="auth-footer-text">
              Already approved?
              <a routerLink="/login" class="font-semibold text-primary hover:underline">Sign in</a>
            </p>
          }
        </div>
      </section>
    </div>
  `,
})
export class RegisterComponent {
  businessName = '';
  email = '';
  phone = '';
  plan: SubscriptionPlan = 'STARTER';
  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly errorMessage = signal('');

  constructor(private readonly authService: AuthService) {}

  async onSubmit(): Promise<void> {
    this.errorMessage.set('');
    this.submitting.set(true);
    try {
      await this.authService.register({
        name: this.businessName,
        email: this.email,
        phone: this.phone,
        plan: this.plan,
      });
      this.submitted.set(true);
    } catch (error) {
      this.errorMessage.set(error instanceof AuthError ? error.message : 'Unable to submit application.');
    } finally {
      this.submitting.set(false);
    }
  }
}
