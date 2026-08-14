import { Component, OnInit, inject, signal } from '@angular/core';

import { Loading } from '../../components/loading/loading';
import { ProductCard } from '../../components/product-card/product-card';
import { Product } from '../../models/product.model';
import { FavoriteService } from '../../services/favorite.service';

@Component({
  selector: 'app-favorites',
  imports: [ProductCard, Loading],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class Favorites implements OnInit {
  private readonly favoriteService = inject(FavoriteService);

  protected readonly favorites = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadFavorites();
  }

  onRemoveFavorite(productId: string): void {
    this.favoriteService.remove(productId).subscribe({
      next: () => {
        this.favorites.update((current) => current.filter((product) => product.id !== productId));
      },
    });
  }

  private loadFavorites(): void {
    this.loading.set(true);
    this.error.set(null);

    this.favoriteService.getAll().subscribe({
      next: (favorites) => {
        this.favorites.set(favorites);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar tus favoritos.');
        this.loading.set(false);
      },
    });
  }
}
