import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SubscriptionPlan } from '../../../core/models';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-layout">
      <aside class="auth-brand">
        <div>
          <div class="auth-brand-logo">B</div>
          <p class="mt-6 text-xs font-semibold uppercase tracking-widest text-white/60">Tenant Application</p>
          <h1>Apply to join BRIVIO</h1>
          <p class="auth-brand-desc">
            Submit your business details. A super admin will review your application before your store workspace is activated.
          </p>
        </div>
        <p class="auth-brand-footer">Approval usually within 1–2 business days.</p>
      </aside>

      <section class="auth-form-panel" data-theme="brivio">
        <div class="auth-form-inner">
          @if (submitted()) {
            <div class="space-y-4">
              <div class="rounded-lg border border-success/30 bg-success/10 px-4 py-4 text-sm">
                <p class="font-semibold text-success">Application submitted</p>
                <p class="mt-1 text-base-content/70">
                  Your application is pending review. You'll be able to sign in once a super admin approves it.
                </p>
              </div>
              <a routerLink="/login" class="btn btn-primary w-full">Back to sign in</a>
            </div>
          } @else {
            <div>
              <h2>Tenant application</h2>
              <p class="auth-subtitle mt-1">Tell us about your business.</p>
            </div>

            @if (errorMessage()) {
              <div class="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                {{ errorMessage() }}
              </div>
            }

            <form class="space-y-4" (ngSubmit)="onSubmit()">
              <div>
                <label class="field-label text-gray-600">Business name</label>
                <input class="input input-bordered w-full" [(ngModel)]="businessName" name="businessName" required placeholder="Sugarblitz Coffee" />
              </div>
              <div>
                <label class="field-label text-gray-600">Contact email</label>
                <input class="input input-bordered w-full" [(ngModel)]="email" name="email" type="email" required placeholder="owner@store.com" />
              </div>
              <div>
                <label class="field-label text-gray-600">Phone</label>
                <input class="input input-bordered w-full" [(ngModel)]="phone" name="phone" required placeholder="+63 912 345 6789" />
              </div>
              <div>
                <label class="field-label text-gray-600">Plan</label>
                <select class="select select-bordered w-full" [(ngModel)]="plan" name="plan">
                  <option value="STARTER">Starter — $29/mo</option>
                  <option value="GROWTH">Growth — $79/mo</option>
                  <option value="PREMIUM">Premium — $149/mo</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary w-full" [disabled]="submitting()">
                {{ submitting() ? 'Submitting…' : 'Submit application' }}
              </button>
            </form>

            <p class="text-sm text-gray-500">
              Already approved?
              <a routerLink="/login" class="link link-primary no-underline hover:underline">Sign in</a>
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

  constructor(private readonly mockDataService: MockDataService) {}

  onSubmit(): void {
    this.errorMessage.set('');
    this.submitting.set(true);
    try {
      this.mockDataService.createTenantApplication({
        name: this.businessName,
        email: this.email,
        phone: this.phone,
        plan: this.plan,
      });
      this.submitted.set(true);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Unable to submit application.');
    } finally {
      this.submitting.set(false);
    }
  }
}
