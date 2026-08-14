import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { Product } from '../models/product.model';
import { ProductService } from './product.service';

const mockProduct: Product = {
  id: 'p1',
  name: 'Silla de madera',
  description: 'Minimalista',
  price: 149,
  stock: 10,
  categoryId: 'c1',
  category: { id: 'c1', name: 'Muebles', description: null, createdAt: '', updatedAt: '' },
  images: [],
  createdAt: '',
  updatedAt: '',
};

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/products`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll arma los query params (search, categoryId, page, limit)', () => {
    service
      .getAll({ search: 'silla', categoryId: 'c1', page: 2, limit: 12 })
      .subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === apiUrl && r.method === 'GET',
    );
    expect(req.request.params.get('search')).toBe('silla');
    expect(req.request.params.get('categoryId')).toBe('c1');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('12');

    req.flush({ data: [mockProduct], total: 1, page: 2, limit: 12, totalPages: 1 });
  });

  it('getAll sin filtros no manda query params', () => {
    service.getAll().subscribe();

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.params.keys().length).toBe(0);
    req.flush({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 });
  });

  it('getById pide GET /products/:id', () => {
    service.getById('p1').subscribe((product) => {
      expect(product).toEqual(mockProduct);
    });

    const req = httpMock.expectOne(`${apiUrl}/p1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProduct);
  });

  it('create manda POST con el payload', () => {
    const payload = {
      name: 'Silla',
      price: 149,
      stock: 10,
      categoryId: 'c1',
    };

    service.create(payload).subscribe();

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockProduct);
  });

  it('update manda PATCH a /products/:id', () => {
    service.update('p1', { price: 199 }).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/p1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ price: 199 });
    req.flush({ ...mockProduct, price: 199 });
  });

  it('delete manda DELETE a /products/:id', () => {
    service.delete('p1').subscribe();

    const req = httpMock.expectOne(`${apiUrl}/p1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
