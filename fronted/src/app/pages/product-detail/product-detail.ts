import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Loading } from '../../components/loading/loading';
import { ApiError } from '../../models/api-error.model';
import { Product } from '../../models/product.model';
import { AuthService } from '../../services/auth.service';
import { FavoriteService } from '../../services/favorite.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe, RouterLink, Loading],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly favoriteService = inject(FavoriteService);
  private readonly authService = inject(AuthService);

  protected readonly isAuthenticated = this.authService.isAuthenticated;

  protected readonly product = signal<Product | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly activeImageIndex = signal(0);
  protected readonly isFavorite = signal(false);
  protected readonly favoriteBusy = signal(false);
  protected readonly favoriteError = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Producto no encontrado.');
      this.loading.set(false);
      return;
    }

    this.productService.getById(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
        if (this.isAuthenticated()) {
          this.checkFavoriteStatus(id);
        }
      },
      error: () => {
        this.error.set('No pudimos encontrar este producto.');
        this.loading.set(false);
      },
    });
  }

  selectImage(index: number): void {
    this.activeImageIndex.set(index);
  }

  toggleFavorite(): void {
    const product = this.product();
    if (!product || this.favoriteBusy()) {
      return;
    }

    this.favoriteBusy.set(true);
    this.favoriteError.set(null);
    const removing = this.isFavorite();
    const request = removing
      ? this.favoriteService.remove(product.id)
      : this.favoriteService.add(product.id);

    request.subscribe({
      next: () => {
        this.isFavorite.update((current) => !current);
        this.favoriteBusy.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.favoriteBusy.set(false);
        this.favoriteError.set(
          this.extractMessage(
            error,
            removing ? 'No pudimos quitar el producto de favoritos.' : 'No pudimos agregar el producto a favoritos.',
          ),
        );
      },
    });
  }

  private extractMessage(error: HttpErrorResponse, fallback: string): string {
    const apiError = error.error as ApiError | undefined;
    if (Array.isArray(apiError?.message)) {
      return apiError.message.join(' ');
    }
    if (apiError?.message) {
      return apiError.message;
    }
    if (error.status === 404) {
      return 'Este producto ya no está disponible.';
    }
    return fallback;
  }

  private checkFavoriteStatus(productId: string): void {
    this.favoriteService.getAll().subscribe({
      next: (favorites) => this.isFavorite.set(favorites.some((p) => p.id === productId)),
      error: () => this.isFavorite.set(false),
    });
  }
}
