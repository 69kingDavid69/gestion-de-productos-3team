import { TestBed } from '@angular/core/testing';

import { Category } from '../../models/category.model';
import { Sidebar } from './sidebar';

const mockCategories: Category[] = [
  { id: 'c1', name: 'Muebles', description: null, createdAt: '', updatedAt: '' },
  { id: 'c2', name: 'Decoración', description: null, createdAt: '', updatedAt: '' },
];

describe('Sidebar', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Sidebar] });
  });

  it('lista "Todas" más una entrada por categoría', () => {
    const fixture = TestBed.createComponent(Sidebar);
    fixture.componentRef.setInput('categories', mockCategories);
    fixture.detectChanges();

    const items = (fixture.nativeElement as HTMLElement).querySelectorAll('.filter-option');
    expect(items.length).toBe(3);
    expect(items[0].textContent).toContain('Todas');
    expect(items[1].textContent).toContain('Muebles');
    expect(items[2].textContent).toContain('Decoración');
  });

  it('marca como tildada la categoría seleccionada', () => {
    const fixture = TestBed.createComponent(Sidebar);
    fixture.componentRef.setInput('categories', mockCategories);
    fixture.componentRef.setInput('selectedCategoryId', 'c2');
    fixture.detectChanges();

    const checked = (fixture.nativeElement as HTMLElement).querySelector(
      '.filter-option input:checked',
    );
    expect(checked?.closest('.filter-option')?.textContent).toContain('Decoración');
  });

  it('emite selectCategory con el id al elegir una categoría', () => {
    const fixture = TestBed.createComponent(Sidebar);
    fixture.componentRef.setInput('categories', mockCategories);
    fixture.detectChanges();

    const emitted: (string | null)[] = [];
    fixture.componentInstance.selectCategory.subscribe((id) => emitted.push(id));

    const inputs = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.filter-option input',
    ) as NodeListOf<HTMLInputElement>;
    inputs[2].click(); // "Decoración"
    inputs[0].click(); // "Todas"

    expect(emitted).toEqual(['c2', null]);
  });

  it('colapsa y expande el grupo de categorías', () => {
    const fixture = TestBed.createComponent(Sidebar);
    fixture.componentRef.setInput('categories', mockCategories);
    fixture.detectChanges();

    const header = (fixture.nativeElement as HTMLElement).querySelector(
      '.filter-group-header',
    ) as HTMLButtonElement;

    header.click();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.filter-option').length).toBe(0);

    header.click();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.filter-option').length).toBe(3);
  });
});
