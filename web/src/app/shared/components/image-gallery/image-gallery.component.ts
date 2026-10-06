import { ChangeDetectionStrategy, Component, HostListener, Input, signal } from '@angular/core';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageGalleryComponent {
  @Input({ required: true }) images: string[] = [];
  @Input() alt = '';

  readonly activeIndex = signal<number | null>(null);
  readonly isOpen = signal(false);

  open(index: number): void {
    this.activeIndex.set(index);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.activeIndex.set(null);
  }

  select(index: number): void {
    this.activeIndex.set(index);
  }

  navigate(direction: 1 | -1): void {
    if (this.images.length <= 1) {
      return;
    }
    const current = this.activeIndex() ?? 0;
    const next = (current + direction + this.images.length) % this.images.length;
    this.activeIndex.set(next);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.isOpen()) {
      return;
    }
    switch (event.key) {
      case 'Escape':
        this.close();
        break;
      case 'ArrowRight':
        this.navigate(1);
        break;
      case 'ArrowLeft':
        this.navigate(-1);
        break;
    }
  }
}
