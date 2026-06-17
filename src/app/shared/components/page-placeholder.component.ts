import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-placeholder',
  standalone: true,
  template: `
    <section class="space-y-6">
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <h1 class="card-title text-2xl">{{ title }}</h1>
          <p class="text-base-content/70">{{ description }}</p>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title text-lg">{{ panelTitle }}</h2>
            <p class="text-sm text-base-content/70">{{ panelDescription }}</p>
            <div class="overflow-x-auto">
              <table class="table table-zebra table-sm">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Status</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Record A</td><td><span class="badge badge-success badge-sm">Active</span></td><td>Today</td></tr>
                  <tr><td>Record B</td><td><span class="badge badge-warning badge-sm">Pending</span></td><td>Yesterday</td></tr>
                  <tr><td>Record C</td><td><span class="badge badge-ghost badge-sm">Draft</span></td><td>2 days ago</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title text-lg">Quick Actions</h2>
            <div class="space-y-3">
              <label class="floating-label">
                <span>Name</span>
                <input class="input input-bordered w-full" placeholder="Enter name" />
              </label>
              <label class="floating-label">
                <span>Notes</span>
                <textarea class="textarea textarea-bordered w-full" placeholder="Add notes"></textarea>
              </label>
              <button class="btn btn-primary w-fit">Save Draft</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class PagePlaceholderComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) description = '';
  @Input() panelTitle = 'Overview';
  @Input() panelDescription = 'Use this workspace to manage records and review status.';
}
