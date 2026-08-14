import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  name = '';
  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  submit(): void {
    this.errorMessage = '';
    this.loading = true;

    this.authService.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (error: HttpErrorResponse) => {
        const message = error.error?.message;
        this.errorMessage = Array.isArray(message)
          ? message.join('. ')
          : message || 'No fue posible crear la cuenta.';
        this.loading = false;
      },
    });
  }
}
