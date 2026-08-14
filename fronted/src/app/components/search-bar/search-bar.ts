import { Component, input, model, output } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar {
  readonly placeholder = input('Buscar productos...');
  readonly query = model('');
  readonly search = output<string>();

  onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.search.emit(this.query().trim());
  }
}
