import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { Category } from '../../models/category.model';
import { Categories } from './categories';

const mockCategory: Category = {
  id: 'c1',
  name: 'Muebles',
  description: 'Sillas, mesas, etc.',
  createdAt: '',
  updatedAt: '',
};

const apiUrl = `${environment.apiUrl}/categories`;

/** Busca un botón por su texto visible. */
function clickButton(fixture: ComponentFixture<Categories>, text: string): void {
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

function actionErrorText(fixture: ComponentFixture<Categories>): string {
  const element = (fixture.nativeElement as HTMLElement).querySelector('.action-error');
  return element?.textContent?.trim() ?? '';
}

describe('Categories (manejo de errores al eliminar)', () => {
  let fixture: ComponentFixture<Categories>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Categories],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Categories);
    fixture.detectChanges();

    httpMock.expectOne(apiUrl).flush([mockCategory]);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  /** Abre la confirmación y responde el DELETE con el error indicado. */
  function deleteWith(body: Record<string, unknown> | null, status: number, statusText: string): void {
    clickButton(fixture, 'Eliminar');
    clickButton(fixture, 'Sí');
    httpMock.expectOne(`${apiUrl}/c1`).flush(body, { status, statusText });
    fixture.detectChanges();
  }

  it('muestra el mensaje que devuelve la API cuando falla el borrado', () => {
    deleteWith(
      { statusCode: 409, message: 'La categoría tiene productos asociados.', error: 'Conflict' },
      409,
      'Conflict',
    );

    expect(actionErrorText(fixture)).toContain('La categoría tiene productos asociados.');
  });

  it('muestra un mensaje propio ante un 404 sin cuerpo', () => {
    deleteWith(null, 404, 'Not Found');

    expect(actionErrorText(fixture)).toContain('ya no existe');
  });

  it('muestra un mensaje propio ante un 409 sin cuerpo', () => {
    deleteWith(null, 409, 'Conflict');

    expect(actionErrorText(fixture)).toContain('en uso');
  });

  it('no deja la categoría en la lista ni muestra error cuando el borrado funciona', () => {
    clickButton(fixture, 'Eliminar');
    clickButton(fixture, 'Sí');
    httpMock.expectOne(`${apiUrl}/c1`).flush(null);
    fixture.detectChanges();

    expect(actionErrorText(fixture)).toBe('');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Todavía no hay categorías cargadas.',
    );
  });

  it('limpia el error anterior al iniciar un nuevo intento de borrado', () => {
    deleteWith(null, 404, 'Not Found');
    expect(actionErrorText(fixture)).not.toBe('');

    clickButton(fixture, 'Eliminar');

    expect(actionErrorText(fixture)).toBe('');

    clickButton(fixture, 'No');
  });
});
