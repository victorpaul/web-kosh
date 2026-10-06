import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { TimelineService } from '../../../core/timeline/timeline.service';
import { TimelineItem, TimelineItemType } from '../../../core/models/timeline-item.model';
import { ImageGalleryComponent } from '../image-gallery/image-gallery.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { LocalizePipe } from '../../../core/i18n/localize.pipe';
import { I18nService } from '../../../core/i18n/i18n.service';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [ImageGalleryComponent, TranslatePipe, LocalizePipe],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent implements OnInit {
  private readonly i18n = inject(I18nService);

  readonly items = signal<TimelineItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly showWork = signal(true);
  readonly showPersonal = signal(false);

  constructor(private readonly timelineService: TimelineService) {}

  ngOnInit(): void {
    this.timelineService.getTimelineItems().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  /* description lines may hold links (company names), so they are rendered as HTML */
  description(item: TimelineItem): string {
    return (item.description ?? []).map((line) => this.i18n.localize(line)).join('<br>');
  }

  isVisible(type: TimelineItemType): boolean {
    return type === 'work' ? this.showWork() : this.showPersonal();
  }

  toggleWork(): void {
    this.showWork.set(!this.showWork());
  }

  togglePersonal(): void {
    this.showPersonal.set(!this.showPersonal());
  }
}
