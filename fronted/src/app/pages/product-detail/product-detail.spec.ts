import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { environment } from '../../../environments/environment';
import { Category } from '../../models/category.model';
import { Product } from '../../models/product.model';
import { ProductDetail } from './product-detail';

const mockCategory: Category = {
  id: 'c1',
  name: 'Muebles',
  description: null,
  createdAt: '',
  updatedAt: '',
};

const mockProduct: Product = {
  id: 'p1',
  name: 'Silla de madera',
  description: 'Minimalista',
  price: 149,
  stock: 5,
  categoryId: 'c1',
  category: mockCategory,
  images: [],
  createdAt: '',
  updatedAt: '',
};

const productsUrl = `${environment.apiUrl}/products`;
const favoritesUrl = `${environment.apiUrl}/favorites`;

function favoriteErrorText(fixture: ComponentFixture<ProductDetail>): string {
  const element = (fixture.nativeElement as HTMLElement).querySelector('.action-error');
  return element?.textContent?.trim() ?? '';
}

function clickFavorite(fixture: ComponentFixture<ProductDetail>): void {
  const button = (fixture.nativeElement as HTMLElement).querySelector(
    '.favorite-btn',
  ) as HTMLButtonElement;
  button.click();
  fixture.detectChanges();
}

describe('ProductDetail (manejo de errores en favoritos)', () => {
  let fixture: ComponentFixture<ProductDetail>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // El botón de favoritos solo se muestra con sesión activa.
    localStorage.setItem('accessToken', 'token');
    localStorage.setItem(
      'currentUser',
      JSON.stringify({ id: 'u1', name: 'Juan', email: 'juan@test.com', createdAt: '' }),
    );

    TestBed.configureTestingModule({
      imports: [ProductDetail],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map([['id', 'p1']]) } },
        },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ProductDetail);
    fixture.detectChanges();

    httpMock.expectOne(`${productsUrl}/p1`).flush(mockProduct);
    // Al cargar consulta los favoritos para saber si ya está marcado.
    httpMock.expectOne(favoritesUrl).flush([]);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('avisa cuando no se pudo agregar a favoritos', () => {
    clickFavorite(fixture);
    httpMock
      .expectOne(`${favoritesUrl}/p1`)
      .flush(null, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(favoriteErrorText(fixture)).toContain('No pudimos agregar');
  });

  it('muestra el mensaje de la API cuando lo hay', () => {
    clickFavorite(fixture);
    httpMock
      .expectOne(`${favoritesUrl}/p1`)
      .flush(
        { statusCode: 409, message: 'El producto ya está en favoritos.', error: 'Conflict' },
        { status: 409, statusText: 'Conflict' },
      );
    fixture.detectChanges();

    expect(favoriteErrorText(fixture)).toContain('El producto ya está en favoritos.');
  });

  it('avisa con el texto de quitar cuando falla al remover un favorito', () => {
    // Primer click: agrega correctamente, queda marcado como favorito.
    clickFavorite(fixture);
    httpMock.expectOne(`${favoritesUrl}/p1`).flush({});
    fixture.detectChanges();

    // Segundo click: intenta quitarlo y falla.
    clickFavorite(fixture);
    const request = httpMock.expectOne(`${favoritesUrl}/p1`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(favoriteErrorText(fixture)).toContain('No pudimos quitar');
  });

  it('no muestra ningún error cuando la operación funciona', () => {
    clickFavorite(fixture);
    httpMock.expectOne(`${favoritesUrl}/p1`).flush({});
    fixture.detectChanges();

    expect(favoriteErrorText(fixture)).toBe('');
  });
});
