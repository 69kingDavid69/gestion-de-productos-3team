import { Component, input, output, signal } from '@angular/core';

import { Category } from '../../models/category.model';

/**
 * Panel de filtros lateral (estilo Stitch). Presentacional: no llama
 * servicios, solo emite la categoría elegida para que el contenedor decida
 * qué hacer. La selección es única: tocar una categoría destilda la anterior.
 */
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  readonly categories = input.required<Category[]>();
  readonly selectedCategoryId = input<string | null>(null);
  readonly title = input('Categorías');

  readonly selectCategory = output<string | null>();

  protected readonly collapsed = signal(false);

  toggle(): void {
    this.collapsed.update((value) => !value);
  }

  /** Si tocan la categoría ya activa, se limpia el filtro. */
  onPick(categoryId: string): void {
    this.selectCategory.emit(this.selectedCategoryId() === categoryId ? null : categoryId);
  }
}
