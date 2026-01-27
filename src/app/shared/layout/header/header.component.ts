import { Component } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeToggleComponent } from '../../ui/theme-toggle/theme-toggle.component';
import { NgIconComponent } from '@ng-icons/core';

type NavItem = { to: string; label: string };

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, RouterLinkActive, ThemeToggleComponent, NgIconComponent],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  // --- Estado UI (equivalente a useHeader().system) ---
  isMobileMenuOpen = false;

  // --- Stub auth (luego lo conectamos a AuthService/store) ---
  isAuthenticated = false;
  userName = 'Flor';

  navItems: NavItem[] = [
    { to: '/feed', label: 'Feed' },
    { to: '/myposts', label: 'Mis posts' },
    { to: '/profile', label: 'Perfil' },
  ];

  // --- Acciones (equivalente a useHeader().actions) ---
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  onLogoutClick() {
    // TODO: conectar logout real + toast luego
    this.isAuthenticated = false;
    this.closeMobileMenu();
  }
}
