import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { Product } from '../../models/product.model';
import { ProductCard } from './product-card';

const mockProduct: Product = {
  id: 'p1',
  name: 'Silla de madera',
  description: 'Minimalista',
  price: 149,
  stock: 5,
  categoryId: 'c1',
  category: { id: 'c1', name: 'Muebles', description: null, createdAt: '', updatedAt: '' },
  images: [],
  createdAt: '',
  updatedAt: '',
};

describe('ProductCard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProductCard],
      providers: [provideRouter([])],
    });
  });

  it('muestra el nombre y el precio del producto', () => {
    const fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('product', mockProduct);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Silla de madera');
    expect(text).toContain('149');
  });

  it('no muestra el botón de favorito si showFavorite es false', () => {
    const fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('product', mockProduct);
    fixture.componentRef.setInput('showFavorite', false);
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector('.favorite-toggle');
    expect(button).toBeNull();
  });

  it('emite favoriteToggle con el id del producto al hacer click en el corazón', () => {
    const fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('product', mockProduct);
    fixture.componentRef.setInput('showFavorite', true);
    fixture.detectChanges();

    const emitted: string[] = [];
    fixture.componentInstance.favoriteToggle.subscribe((id) => emitted.push(id));

    const button = (fixture.nativeElement as HTMLElement).querySelector(
      '.favorite-toggle',
    ) as HTMLButtonElement;
    button.click();

    expect(emitted).toEqual(['p1']);
  });

  it('muestra "Agotado" cuando no hay stock', () => {
    const fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('product', { ...mockProduct, stock: 0 });
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Agotado');
  });
});
