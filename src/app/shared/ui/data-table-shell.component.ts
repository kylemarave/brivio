import { Component, input } from '@angular/core';

@Component({
  selector: 'app-data-table-shell',
  standalone: true,
  template: `
    <section>
      <header class="page-header-row">
        <div class="page-header mb-0">
          <h1>{{ title() }}</h1>
          <p>{{ description() }}</p>
        </div>
        <ng-content select="[table-action]"></ng-content>
      </header>

      <div class="panel">
        <div class="panel-body gap-4 flex flex-col">
          <ng-content select="[table-filters]"></ng-content>
          <ng-content select="[table-content]"></ng-content>
          <ng-content select="[table-footer]"></ng-content>
        </div>
      </div>
    </section>
  `,
})
export class DataTableShellComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
