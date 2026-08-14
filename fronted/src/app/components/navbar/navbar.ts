import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly currentUser = this.authService.currentUser;
  loading = false;

  logout(): void {
    this.loading = true;
    this.authService.logout().pipe(
      finalize(() => {
        this.authService.clearSession();
        this.router.navigate(['/']);
      }),
    ).subscribe();
  }
}
