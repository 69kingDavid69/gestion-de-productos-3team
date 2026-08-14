import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Loading } from '../../components/loading/loading';
import { ApiError } from '../../models/api-error.model';
import { Category, CategoryPayload } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-categories',
  imports: [ReactiveFormsModule, Loading],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly fb = inject(FormBuilder);

  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly formOpen = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly formError = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly confirmDeleteId = signal<string | null>(null);
  protected readonly deletingId = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  openCreateForm(): void {
    this.editingId.set(null);
    this.formError.set(null);
    this.form.reset({ name: '', description: '' });
    this.formOpen.set(true);
  }

  openEditForm(category: Category): void {
    this.editingId.set(category.id);
    this.formError.set(null);
    this.form.reset({ name: category.name, description: category.description ?? '' });
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: CategoryPayload = {
      name: raw.name,
      description: raw.description || undefined,
    };

    this.submitting.set(true);
    this.formError.set(null);

    const editingId = this.editingId();
    const request = editingId
      ? this.categoryService.update(editingId, payload)
      : this.categoryService.create(payload);

    request.subscribe({
      next: () => {
        this.submitting.set(false);
        this.formOpen.set(false);
        this.loadCategories();
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.formError.set(this.extractMessage(error));
      },
    });
  }

  askDelete(id: string): void {
    this.confirmDeleteId.set(id);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  confirmDelete(id: string): void {
    this.deletingId.set(id);
    this.categoryService.delete(id).subscribe({
      next: () => {
        this.categories.update((current) => current.filter((category) => category.id !== id));
        this.deletingId.set(null);
        this.confirmDeleteId.set(null);
      },
      error: () => {
        this.deletingId.set(null);
        this.confirmDeleteId.set(null);
      },
    });
  }

  private loadCategories(): void {
    this.loading.set(true);
    this.error.set(null);

    this.categoryService.getAll().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar las categorías.');
        this.loading.set(false);
      },
    });
  }

  private extractMessage(error: HttpErrorResponse): string {
    const apiError = error.error as ApiError | undefined;
    if (Array.isArray(apiError?.message)) {
      return apiError.message.join(' ');
    }
    return apiError?.message ?? 'Ocurrió un error. Intentá de nuevo.';
  }
}
