import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TenantSettings } from '../../../core/models';
import { TenantContextService } from '../services/tenant-context.service';
import { TenantStoreService } from '../services/tenant-store.service';

@Component({
  selector: 'app-tenant-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="space-y-4">
      <h1 class="text-2xl font-semibold">Settings</h1>
      <div class="grid gap-4 lg:grid-cols-2">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body space-y-2">
            <h2 class="card-title">General</h2>
            <input class="input input-bordered" [(ngModel)]="settings.storeName" placeholder="Store Name" />
            <input class="input input-bordered" [(ngModel)]="settings.timezone" placeholder="Timezone" />
          </div>
        </div>
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body space-y-2">
            <h2 class="card-title">Security</h2>
            <label class="label cursor-pointer justify-start gap-2">
              <input type="checkbox" class="toggle toggle-primary" [(ngModel)]="settings.twoFactor" />
              <span>Enable 2FA</span>
            </label>
            <label class="label cursor-pointer justify-start gap-2">
              <input type="checkbox" class="toggle toggle-primary" [(ngModel)]="settings.requirePinRefund" />
              <span>Require PIN for Refund</span>
            </label>
          </div>
        </div>
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body space-y-2">
            <h2 class="card-title">Notifications</h2>
            <label class="label cursor-pointer justify-start gap-2">
              <input type="checkbox" class="checkbox" [(ngModel)]="settings.emailAlerts" />
              <span>Email Alerts</span>
            </label>
            <label class="label cursor-pointer justify-start gap-2">
              <input type="checkbox" class="checkbox" [(ngModel)]="settings.lowStockAlerts" />
              <span>Low Stock Alerts</span>
            </label>
          </div>
        </div>
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body space-y-2">
            <h2 class="card-title">Integrations</h2>
            <input class="input input-bordered" [(ngModel)]="settings.paymentGateway" placeholder="Payment Gateway" />
            <input class="input input-bordered" [(ngModel)]="settings.emailProvider" placeholder="Email Provider" />
          </div>
        </div>
      </div>
      <button class="btn btn-primary" (click)="save()">Save Settings</button>
    </section>
  `,
})
export class TenantSettingsComponent {
  private readonly storeService = inject(TenantStoreService);
  private readonly tenantContext = inject(TenantContextService);

  settings: TenantSettings = {
    tenantId: '',
    storeName: '',
    timezone: '',
    twoFactor: false,
    requirePinRefund: false,
    emailAlerts: false,
    lowStockAlerts: false,
    paymentGateway: '',
    emailProvider: '',
  };

  constructor() {
    effect(() => {
      this.tenantContext.refreshTick();
      this.reload();
    });
  }

  save(): void {
    this.storeService
      .updateSettings({
        storeName: this.settings.storeName,
        timezone: this.settings.timezone,
        twoFactor: this.settings.twoFactor,
        requirePinRefund: this.settings.requirePinRefund,
        emailAlerts: this.settings.emailAlerts,
        lowStockAlerts: this.settings.lowStockAlerts,
        paymentGateway: this.settings.paymentGateway,
        emailProvider: this.settings.emailProvider,
      })
      .subscribe((updated) => {
        this.settings = { ...updated };
      });
  }

  private reload(): void {
    this.storeService.getSettings().subscribe((data) => {
      this.settings = { ...data };
    });
  }
}
