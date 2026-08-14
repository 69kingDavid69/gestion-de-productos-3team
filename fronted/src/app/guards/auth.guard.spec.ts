import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';

import { authGuard } from './auth.guard';

describe('authGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([])],
    });
  });

  afterEach(() => localStorage.clear());

  it('permite el acceso cuando hay una sesión activa', () => {
    localStorage.setItem('accessToken', 'token');
    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/profile' } as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => authGuard(route, state));

    expect(result).toBe(true);
  });

  it('redirige a /login con el returnUrl cuando no hay sesión', () => {
    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/profile' } as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => authGuard(route, state)) as UrlTree;

    expect(result.toString()).toContain('/login');
    expect(result.toString()).toContain('returnUrl');
    expect(result.toString()).toContain('profile');
  });
});
