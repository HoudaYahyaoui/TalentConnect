import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

export interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

export interface SearchFilterEvent {
  query: string;
  filters: Record<string, string>;
}

@Component({
  selector: 'app-search-filter-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    MatChipsModule,
  ],
  templateUrl: './search-filter-bar.component.html',
  styleUrls: ['./search-filter-bar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFilterBarComponent {
  @Input() placeholder = 'Rechercher...';
  @Input() filterOptions: FilterOption[] = [];
  @Output() searchChange = new EventEmitter<SearchFilterEvent>();
  @Output() searchClear = new EventEmitter<void>();

  protected query = '';
  protected filters: Record<string, string> = {};
  protected activeFilters = signal<{ key: string; label: string; value: string }[]>([]);

  protected onSearch(): void {
    this.searchChange.emit({ query: this.query, filters: this.filters });
  }

  protected onFilterChange(key: string, value: string, label: string): void {
    if (value) {
      this.filters[key] = value;
      this.activeFilters.update((current) => {
        const filtered = current.filter((f) => f.key !== key);
        return [...filtered, { key, label, value }];
      });
    } else {
      delete this.filters[key];
      this.activeFilters.update((current) => current.filter((f) => f.key !== key));
    }
    this.onSearch();
  }

  protected removeFilter(key: string): void {
    delete this.filters[key];
    this.activeFilters.update((current) => current.filter((f) => f.key !== key));
    this.onSearch();
  }

  protected clearAll(): void {
    this.query = '';
    this.filters = {};
    this.activeFilters.set([]);
    this.searchClear.emit();
  }

  protected trackByKey(_index: number, item: { key: string }): string {
    return item.key;
  }
}
