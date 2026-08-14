import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { Category } from '../models/category.model';
import { CategoryService } from './category.service';

const mockCategory: Category = {
  id: 'c1',
  name: 'Muebles',
  description: 'Sillas, mesas, etc.',
  createdAt: '',
  updatedAt: '',
};

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/categories`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll pide GET /categories', () => {
    service.getAll().subscribe((categories) => {
      expect(categories).toEqual([mockCategory]);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush([mockCategory]);
  });

  it('getById pide GET /categories/:id', () => {
    service.getById('c1').subscribe();

    const req = httpMock.expectOne(`${apiUrl}/c1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCategory);
  });

  it('create manda POST con el payload', () => {
    service.create({ name: 'Muebles', description: 'desc' }).subscribe();

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Muebles', description: 'desc' });
    req.flush(mockCategory);
  });

  it('update manda PATCH a /categories/:id', () => {
    service.update('c1', { name: 'Nuevo nombre' }).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/c1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ name: 'Nuevo nombre' });
    req.flush({ ...mockCategory, name: 'Nuevo nombre' });
  });

  it('delete manda DELETE a /categories/:id', () => {
    service.delete('c1').subscribe();

    const req = httpMock.expectOne(`${apiUrl}/c1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
