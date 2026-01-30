import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';

function getWindow(page: number, total: number) {
  const delta = 2;
  const start = Math.max(1, page - delta);
  const end = Math.min(total, page + delta);
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return { start, end, pages };
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  templateUrl: './pagination.component.html',
})
export class PaginationComponent {
  @Input({ required: true }) page!: number;
  @Input({ required: true }) totalPages!: number;

  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() goTo = new EventEmitter<number>();

  get window() {
    return getWindow(this.page, this.totalPages);
  }

  onPrev() {
    if (this.page > 1) this.prev.emit();
  }

  onNext() {
    if (this.page < this.totalPages) this.next.emit();
  }

  onGoTo(p: number) {
    this.goTo.emit(p);
  }
}
