import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Loading } from '../../components/loading/loading';
import { ApiError } from '../../models/api-error.model';
import { Category } from '../../models/category.model';
import { Product, ProductPayload } from '../../models/product.model';
import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/product.service';

const ADMIN_PAGE_LIMIT = 100;

@Component({
  selector: 'app-products',
  imports: [ReactiveFormsModule, Loading, CurrencyPipe],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly fb = inject(FormBuilder);

  protected readonly products = signal<Product[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly searchTerm = signal('');

  protected readonly formOpen = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly formError = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly confirmDeleteId = signal<string | null>(null);
  protected readonly deletingId = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    categoryId: ['', Validators.required],
    images: [''],
  });

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.categories.set([]),
    });
    this.loadProducts();
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.loadProducts();
  }

  openCreateForm(): void {
    this.editingId.set(null);
    this.formError.set(null);
    this.form.reset({ name: '', description: '', price: 0, stock: 0, categoryId: '', images: '' });
    this.formOpen.set(true);
  }

  openEditForm(product: Product): void {
    this.editingId.set(product.id);
    this.formError.set(null);
    this.form.reset({
      name: product.name,
      description: product.description ?? '',
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      images: product.images
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((image) => image.url)
        .join(', '),
    });
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
    const payload: ProductPayload = {
      name: raw.name,
      description: raw.description || undefined,
      price: Number(raw.price),
      stock: Number(raw.stock),
      categoryId: raw.categoryId,
      images: raw.images
        .split(',')
        .map((url) => url.trim())
        .filter((url) => url.length > 0),
    };

    this.submitting.set(true);
    this.formError.set(null);

    const editingId = this.editingId();
    const request = editingId
      ? this.productService.update(editingId, payload)
      : this.productService.create(payload);

    request.subscribe({
      next: () => {
        this.submitting.set(false);
        this.formOpen.set(false);
        this.loadProducts();
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
    this.productService.delete(id).subscribe({
      next: () => {
        this.products.update((current) => current.filter((product) => product.id !== id));
        this.deletingId.set(null);
        this.confirmDeleteId.set(null);
      },
      error: () => {
        this.deletingId.set(null);
        this.confirmDeleteId.set(null);
      },
    });
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService
      .getAll({ search: this.searchTerm() || undefined, limit: ADMIN_PAGE_LIMIT })
      .subscribe({
        next: (response) => {
          this.products.set(response.data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No pudimos cargar los productos.');
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
