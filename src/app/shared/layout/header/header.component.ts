import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeToggleComponent } from '../../ui/theme-toggle/theme-toggle.component';
import { NgIconComponent } from '@ng-icons/core';
import { AuthSessionService } from '../../../features/auth/services/auth-session.service';
import { AuthService } from '../../../features/auth/services/auth.service';
import { ToastService } from '../../ui/toast/toast.service';

type NavItem = { to: string; label: string };

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ThemeToggleComponent, NgIconComponent],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private session = inject(AuthSessionService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  // --- Estado UI ---
  isMobileMenuOpen = false;

  // --- Stub auth (después lo conectamos a AuthSessionService) ---
  isAuthenticated = computed(() => this.session.isAuthenticated());
  userName = computed(() => this.session.userName());

  navItems: NavItem[] = [
    { to: '/feed', label: 'Feed' },
    { to: '/myposts', label: 'Mis posts' },
    { to: '/profile', label: 'Perfil' },
  ];

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  onLogoutClick() {
    this.session.clear();
    this.auth.clearSession();

    this.toast.success('Sesión cerrada');
    this.closeMobileMenu();
    this.router.navigateByUrl('/login');
  }
}
