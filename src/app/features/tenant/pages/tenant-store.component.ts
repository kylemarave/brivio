import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreProfile } from '../../../core/models';
import { TenantContextService } from '../services/tenant-context.service';
import { TenantStoreService } from '../services/tenant-store.service';

@Component({
  selector: 'app-tenant-store',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="space-y-5">
      <div>
        <h1 class="text-2xl font-semibold">Store</h1>
        <p class="text-base-content/70">Manage store profile, business hours, and branding settings.</p>
      </div>
      <div class="grid gap-4 xl:grid-cols-2">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body space-y-3">
            <h2 class="card-title">Store Profile</h2>
            <input class="input input-bordered" [(ngModel)]="profile.businessName" placeholder="Business Name" />
            <input class="input input-bordered" [(ngModel)]="profile.logo" placeholder="Logo URL" />
            <input class="input input-bordered" [(ngModel)]="profile.banner" placeholder="Banner URL" />
            <textarea class="textarea textarea-bordered" [(ngModel)]="profile.description" placeholder="Description"></textarea>
            <div class="grid gap-3 md:grid-cols-2">
              <input class="input input-bordered" [(ngModel)]="profile.phone" placeholder="Phone" />
              <input class="input input-bordered" [(ngModel)]="profile.email" placeholder="Email" />
            </div>
            <input class="input input-bordered" [(ngModel)]="profile.address" placeholder="Address" />
            <input class="input input-bordered" [(ngModel)]="profile.businessHours" placeholder="Business Hours" />
            <input class="input input-bordered" [(ngModel)]="profile.socialLinks" placeholder="Social Links" />
          </div>
        </div>
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body space-y-3">
            <h2 class="card-title">Branding</h2>
            <label class="label">Primary Color</label>
            <input type="color" class="input input-bordered w-full h-12 p-1" [(ngModel)]="profile.primaryColor" />
            <label class="label">Secondary Color</label>
            <input type="color" class="input input-bordered w-full h-12 p-1" [(ngModel)]="profile.secondaryColor" />
            <select class="select select-bordered" [(ngModel)]="profile.theme">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="cupcake">Cupcake</option>
              <option value="coffee">Coffee</option>
            </select>
            <textarea class="textarea textarea-bordered" [(ngModel)]="profile.receiptFooter" placeholder="Receipt Footer"></textarea>
            <button class="btn btn-primary" (click)="save()">Save Store Settings</button>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class TenantStoreComponent {
  private readonly storeService = inject(TenantStoreService);
  private readonly tenantContext = inject(TenantContextService);

  profile: StoreProfile = {
    tenantId: '',
    businessName: '',
    logo: '',
    banner: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    businessHours: '',
    socialLinks: '',
    primaryColor: '#8b5e3c',
    secondaryColor: '#f7d9aa',
    theme: 'coffee',
    receiptFooter: '',
  };

  constructor() {
    effect(() => {
      this.tenantContext.refreshTick();
      this.reload();
    });
  }

  save(): void {
    this.storeService
      .updateStoreProfile({
        businessName: this.profile.businessName,
        logo: this.profile.logo,
        banner: this.profile.banner,
        description: this.profile.description,
        phone: this.profile.phone,
        email: this.profile.email,
        address: this.profile.address,
        businessHours: this.profile.businessHours,
        socialLinks: this.profile.socialLinks,
        primaryColor: this.profile.primaryColor,
        secondaryColor: this.profile.secondaryColor,
        theme: this.profile.theme,
        receiptFooter: this.profile.receiptFooter,
      })
      .subscribe((updated) => {
        this.profile = { ...updated };
      });
  }

  private reload(): void {
    this.storeService.getStoreProfile().subscribe((data) => {
      this.profile = { ...data };
    });
  }
}
