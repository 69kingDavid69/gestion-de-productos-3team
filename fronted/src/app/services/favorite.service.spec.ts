import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { Product } from '../models/product.model';
import { FavoriteService } from './favorite.service';

const mockProduct: Product = {
  id: 'p1',
  name: 'Silla',
  description: null,
  price: 149,
  stock: 10,
  categoryId: 'c1',
  category: { id: 'c1', name: 'Muebles', description: null, createdAt: '', updatedAt: '' },
  images: [],
  createdAt: '',
  updatedAt: '',
};

describe('FavoriteService', () => {
  let service: FavoriteService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/favorites`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FavoriteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll pide GET /favorites y devuelve productos', () => {
    service.getAll().subscribe((favorites) => {
      expect(favorites).toEqual([mockProduct]);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush([mockProduct]);
  });

  it('add manda POST a /favorites/:productId', () => {
    service.add('p1').subscribe();

    const req = httpMock.expectOne(`${apiUrl}/p1`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('remove manda DELETE a /favorites/:productId', () => {
    service.remove('p1').subscribe();

    const req = httpMock.expectOne(`${apiUrl}/p1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
