import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-table-pagination',
  standalone: true,
  template: `
    <div class="flex items-center justify-between">
      <p class="text-sm text-base-content/70">
        Showing {{ total() === 0 ? 0 : start() + 1 }}-{{ end() }} of {{ total() }}
      </p>
      <div class="join">
        <button class="join-item btn btn-sm" [disabled]="page() <= 1" (click)="previous.emit()">Prev</button>
        <button class="join-item btn btn-sm btn-disabled">Page {{ page() }}/{{ totalPages() }}</button>
        <button class="join-item btn btn-sm" [disabled]="page() >= totalPages()" (click)="next.emit()">Next</button>
      </div>
    </div>
  `,
})
export class TablePaginationComponent {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly total = input.required<number>();
  readonly start = input.required<number>();
  readonly end = input.required<number>();

  readonly previous = output<void>();
  readonly next = output<void>();
}
