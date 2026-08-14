import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Loading } from '../../components/loading/loading';
import { ApiError } from '../../models/api-error.model';
import { User } from '../../models/auth.models';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, Loading, DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);

  protected readonly user = signal<User | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly submitting = signal(false);
  protected readonly passwordError = signal<string | null>(null);
  protected readonly passwordSuccess = signal<string | null>(null);

  protected readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmNewPassword: ['', Validators.required],
  });

  protected get passwordsMismatch(): boolean {
    const { newPassword, confirmNewPassword } = this.passwordForm.getRawValue();
    return confirmNewPassword.length > 0 && newPassword !== confirmNewPassword;
  }

  ngOnInit(): void {
    this.userService.getMe().subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar tu perfil.');
        this.loading.set(false);
      },
    });
  }

  submitPasswordChange(): void {
    this.passwordSuccess.set(null);

    if (this.passwordForm.invalid || this.passwordsMismatch) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.submitting.set(true);
    this.passwordError.set(null);

    this.userService.updatePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.passwordSuccess.set('Tu contraseña se actualizó correctamente.');
        this.passwordForm.reset({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.passwordError.set(this.extractMessage(error));
      },
    });
  }

  private extractMessage(error: HttpErrorResponse): string {
    const apiError = error.error as ApiError | undefined;
    if (Array.isArray(apiError?.message)) {
      return apiError.message.join(' ');
    }
    return apiError?.message ?? 'No pudimos actualizar tu contraseña.';
  }
}
