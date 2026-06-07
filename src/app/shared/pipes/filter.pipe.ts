import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {
  transform<T>(items: T[] | null | undefined, term: string, key?: keyof T): T[] {
    if (!items) return [];
    if (!term || term.trim() === '') return items;
    
    const query = term.toLowerCase().trim();
    
    return items.filter(item => {
      if (key) {
        const val = item[key];
        return val ? String(val).toLowerCase().includes(query) : false;
      }
      return JSON.stringify(item).toLowerCase().includes(query);
    });
  }
}
