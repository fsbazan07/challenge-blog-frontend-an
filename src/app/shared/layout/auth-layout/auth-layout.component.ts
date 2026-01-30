import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ThemeToggleComponent } from '../../ui/theme-toggle/theme-toggle.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet, ThemeToggleComponent, FooterComponent],
  templateUrl: './auth-layout.component.html',
})
export class AuthLayoutComponent {}
