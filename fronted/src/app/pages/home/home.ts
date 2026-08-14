import { Component, OnInit, inject, signal } from '@angular/core';

import { Loading } from '../../components/loading/loading';
import { ProductCard } from '../../components/product-card/product-card';
import { SearchBar } from '../../components/search-bar/search-bar';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Category } from '../../models/category.model';
import { Product } from '../../models/product.model';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';
import { FavoriteService } from '../../services/favorite.service';
import { ProductService } from '../../services/product.service';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-home',
  imports: [ProductCard, SearchBar, Loading, Sidebar],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly favoriteService = inject(FavoriteService);
  private readonly authService = inject(AuthService);

  protected readonly isAuthenticated = this.authService.isAuthenticated;

  protected readonly products = signal<Product[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly favoriteIds = signal<Set<string>>(new Set());

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly searchTerm = signal('');
  protected readonly selectedCategoryId = signal<string | null>(null);
  protected readonly page = signal(1);
  protected readonly total = signal(0);
  protected readonly totalPages = signal(0);

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.categories.set([]),
    });

    if (this.isAuthenticated()) {
      this.favoriteService.getAll().subscribe({
        next: (favorites) => this.favoriteIds.set(new Set(favorites.map((product) => product.id))),
        error: () => this.favoriteIds.set(new Set()),
      });
    }

    this.loadProducts();
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.page.set(1);
    this.loadProducts();
  }

  onSelectCategory(categoryId: string | null): void {
    this.selectedCategoryId.set(categoryId);
    this.page.set(1);
    this.loadProducts();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }
    this.page.set(page);
    this.loadProducts();
  }

  onToggleFavorite(productId: string): void {
    const isFavorite = this.favoriteIds().has(productId);
    const request = isFavorite
      ? this.favoriteService.remove(productId)
      : this.favoriteService.add(productId);

    request.subscribe({
      next: () => {
        this.favoriteIds.update((current) => {
          const next = new Set(current);
          isFavorite ? next.delete(productId) : next.add(productId);
          return next;
        });
      },
    });
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService
      .getAll({
        search: this.searchTerm() || undefined,
        categoryId: this.selectedCategoryId() ?? undefined,
        page: this.page(),
        limit: PAGE_SIZE,
      })
      .subscribe({
        next: (response) => {
          this.products.set(response.data);
          this.total.set(response.total);
          this.totalPages.set(response.totalPages);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No pudimos cargar los productos. Intentá de nuevo en unos segundos.');
          this.loading.set(false);
        },
      });
  }
}
