import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-toolbar.component.html',
})
export class PostToolbarComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
}
