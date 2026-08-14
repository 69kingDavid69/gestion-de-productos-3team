import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
  });

  it('arranca sin sesión cuando localStorage está vacío', () => {
    const service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.getToken()).toBeNull();
  });

  it('restaura la sesión guardada en localStorage al crear el servicio', () => {
    localStorage.setItem('accessToken', 'stored-token');
    localStorage.setItem(
      'currentUser',
      JSON.stringify({ id: '1', name: 'Ana', email: 'ana@test.com' }),
    );

    const service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.name).toBe('Ana');
  });

  it('guarda el token y el usuario al hacer login', () => {
    const service = TestBed.inject(AuthService);
    const httpMock = TestBed.inject(HttpTestingController);
    const mockUser = { id: '1', name: 'Ana', email: 'ana@test.com' };

    service.login({ email: 'ana@test.com', password: 'secret123' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ accessToken: 'fake-token', user: mockUser });

    expect(service.getToken()).toBe('fake-token');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()).toEqual(mockUser);
    expect(localStorage.getItem('accessToken')).toBe('fake-token');
  });

  it('limpia la sesión con clearSession sin llamar al backend', () => {
    localStorage.setItem('accessToken', 'token');
    localStorage.setItem(
      'currentUser',
      JSON.stringify({ id: '1', name: 'Ana', email: 'ana@test.com' }),
    );
    const service = TestBed.inject(AuthService);

    service.clearSession();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('currentUser')).toBeNull();
  });
});
