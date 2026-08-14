import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Loading } from '../../components/loading/loading';
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
    const request = this.isFavorite()
      ? this.favoriteService.remove(product.id)
      : this.favoriteService.add(product.id);

    request.subscribe({
      next: () => {
        this.isFavorite.update((current) => !current);
        this.favoriteBusy.set(false);
      },
      error: () => this.favoriteBusy.set(false),
    });
  }

  private checkFavoriteStatus(productId: string): void {
    this.favoriteService.getAll().subscribe({
      next: (favorites) => this.isFavorite.set(favorites.some((p) => p.id === productId)),
      error: () => this.isFavorite.set(false),
    });
  }
}
