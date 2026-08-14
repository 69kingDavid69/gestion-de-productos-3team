import { CurrencyPipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  readonly product = input.required<Product>();
  /** Solo se muestra el corazón de favorito cuando hay sesión iniciada. */
  readonly showFavorite = input(false);
  readonly isFavorite = input(false);

  readonly favoriteToggle = output<string>();

  protected readonly coverImage = computed(
    () => [...this.product().images].sort((a, b) => a.order - b.order)[0]?.url ?? null,
  );
  protected readonly inStock = computed(() => this.product().stock > 0);

  onToggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoriteToggle.emit(this.product().id);
  }
}
