import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoyaltyProgram } from '../../../core/models';
import { TenantContextService } from '../services/tenant-context.service';
import { TenantMarketingService } from '../services/tenant-marketing.service';

@Component({
  selector: 'app-tenant-loyalty',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="space-y-4">
      <h1 class="text-2xl font-semibold">Loyalty Program</h1>
      <div class="grid gap-4 lg:grid-cols-3">
        <div class="card bg-base-100 shadow-sm lg:col-span-2">
          <div class="card-body space-y-3">
            <h2 class="card-title">Point Rules</h2>
            <label class="label">Points per purchase</label>
            <input class="input input-bordered" type="number" [(ngModel)]="program.pointsPerPurchase" />
            <label class="label">Minimum spend for points</label>
            <input class="input input-bordered" type="number" [(ngModel)]="program.minimumSpend" />
            <label class="label">Points expiry (days)</label>
            <input class="input input-bordered" type="number" [(ngModel)]="program.expiryDays" />
            <button class="btn btn-primary" (click)="save()">Save Rules</button>
          </div>
        </div>
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title">Rewards</h2>
            <ul class="space-y-2">
              @for (reward of program.rewards; track reward.id) {
                <li class="rounded-box bg-base-200 p-3 flex justify-between">
                  <span>{{ reward.name }}</span>
                  <span class="badge badge-info">{{ reward.points }} pts</span>
                </li>
              }
            </ul>
          </div>
        </div>
      </div>
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title">Redemption History</h2>
          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead><tr><th>Customer</th><th>Reward</th><th>Points</th><th>Date</th></tr></thead>
              <tbody>
                @for (entry of program.redemptions; track entry.id) {
                  <tr>
                    <td>{{ entry.customerName }}</td>
                    <td>{{ entry.reward }}</td>
                    <td>{{ entry.points }}</td>
                    <td>{{ entry.date }}</td>
                  </tr>
                } @empty {
                  <tr><td colspan="4" class="text-center text-base-content/60">No redemptions yet.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class TenantLoyaltyComponent {
  private readonly marketingService = inject(TenantMarketingService);
  private readonly tenantContext = inject(TenantContextService);

  program: LoyaltyProgram = {
    tenantId: '',
    pointsPerPurchase: 0,
    minimumSpend: 0,
    expiryDays: 0,
    rewards: [],
    redemptions: [],
  };

  constructor() {
    effect(() => {
      this.tenantContext.refreshTick();
      this.reload();
    });
  }

  save(): void {
    this.marketingService
      .updateLoyaltyProgram({
        pointsPerPurchase: this.program.pointsPerPurchase,
        minimumSpend: this.program.minimumSpend,
        expiryDays: this.program.expiryDays,
        rewards: this.program.rewards.map((r) => ({ id: r.id, name: r.name, points: r.points })),
      })
      .subscribe((updated) => {
        this.program = { ...updated };
      });
  }

  private reload(): void {
    this.marketingService.getLoyaltyProgram().subscribe((data) => {
      this.program = { ...data, rewards: [...data.rewards], redemptions: [...data.redemptions] };
    });
  }
}
