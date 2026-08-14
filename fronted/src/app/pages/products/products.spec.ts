import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { Category } from '../../models/category.model';
import { Product } from '../../models/product.model';
import { Products } from './products';

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
const categoriesUrl = `${environment.apiUrl}/categories`;

function clickButton(fixture: ComponentFixture<Products>, text: string): void {
  const buttons = Array.from(
    (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
  ) as HTMLButtonElement[];
  const button = buttons.find((b) => b.textContent?.trim() === text);
  if (!button) {
    throw new Error(`No se encontró el botón "${text}"`);
  }
  button.click();
  fixture.detectChanges();
}

function actionErrorText(fixture: ComponentFixture<Products>): string {
  const element = (fixture.nativeElement as HTMLElement).querySelector('.action-error');
  return element?.textContent?.trim() ?? '';
}

describe('Products (manejo de errores al eliminar)', () => {
  let fixture: ComponentFixture<Products>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Products],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Products);
    fixture.detectChanges();

    httpMock.expectOne(categoriesUrl).flush([mockCategory]);
    httpMock
      .expectOne((req) => req.url === productsUrl)
      .flush({ data: [mockProduct], total: 1, page: 1, limit: 100 });
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  function deleteWith(body: Record<string, unknown> | null, status: number, statusText: string): void {
    clickButton(fixture, 'Eliminar');
    clickButton(fixture, 'Sí');
    httpMock.expectOne(`${productsUrl}/p1`).flush(body, { status, statusText });
    fixture.detectChanges();
  }

  it('muestra el mensaje que devuelve la API cuando falla el borrado', () => {
    deleteWith(
      { statusCode: 409, message: 'El producto está referenciado.', error: 'Conflict' },
      409,
      'Conflict',
    );

    expect(actionErrorText(fixture)).toContain('El producto está referenciado.');
  });

  it('muestra un mensaje propio ante un 404 sin cuerpo', () => {
    deleteWith(null, 404, 'Not Found');

    expect(actionErrorText(fixture)).toContain('ya no existe');
  });

  it('deja de listar el producto y no muestra error cuando el borrado funciona', () => {
    clickButton(fixture, 'Eliminar');
    clickButton(fixture, 'Sí');
    httpMock.expectOne(`${productsUrl}/p1`).flush(null);
    fixture.detectChanges();

    expect(actionErrorText(fixture)).toBe('');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Todavía no hay productos cargados.',
    );
  });
});
