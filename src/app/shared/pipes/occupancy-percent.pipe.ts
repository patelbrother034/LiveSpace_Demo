import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'occupancyPercent',
  standalone: true
})
export class OccupancyPercentPipe implements PipeTransform {
  transform(occupied: number | undefined | null, total: number | undefined | null): number {
    if (!total || total <= 0 || !occupied) return 0;
    return Math.round((occupied / total) * 100);
  }
}
