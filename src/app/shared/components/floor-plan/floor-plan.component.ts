import { Component, input, output } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';

interface FloorData { id: string; floorNumber: string; name: string; rooms: RoomData[]; }
interface RoomData { id: string; roomNumber: string; beds: { id: string; label: string; status: string; tenantName?: string }[]; }

@Component({
  selector: 'app-floor-plan',
  standalone: true,
  imports: [TooltipModule],
  template: `
    <div class="space-y-6">
      @for (floor of floors(); track floor.id) {
        <div class="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <!-- Floor Header -->
          <div class="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                {{ floor.floorNumber }}
              </div>
              <span class="font-semibold text-sm text-slate-700 dark:text-slate-300">{{ floor.name }}</span>
            </div>
            <span class="text-xs text-slate-400">{{ floor.rooms.length }} rooms</span>
          </div>
          <!-- Rooms -->
          <div class="p-4 flex flex-wrap gap-4">
            @for (room of floor.rooms; track room.id) {
              <div class="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/30 min-w-[120px]">
                <p class="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Room {{ room.roomNumber }}</p>
                <div class="flex gap-1.5">
                  @for (bed of room.beds; track bed.id) {
                    <div class="w-7 h-7 rounded flex items-center justify-center text-[9px] font-bold cursor-pointer hover:scale-110 transition-all"
                      [class]="bed.status === 'Occupied' ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200' : bed.status === 'Vacant' ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'"
                      [pTooltip]="bed.label + ': ' + (bed.tenantName || bed.status)" tooltipPosition="top"
                      (click)="bedClick.emit(bed)">
                      <i [class]="bed.status === 'Occupied' ? 'pi pi-user' : bed.status === 'Vacant' ? 'pi pi-minus' : 'pi pi-wrench'" class="text-[10px]"></i>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class FloorPlanComponent {
  floors = input<FloorData[]>([]);
  bedClick = output<any>();
}
