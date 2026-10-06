import { ChangeDetectionStrategy, Component, ElementRef, Input, signal, viewChild } from '@angular/core';

/* Thumbnail grid; clicking one opens a full-screen viewer. The viewer is a native modal <dialog>: it renders
   in the browser's top layer, so no parent (a transformed card, an overflow:hidden box) can clip or trap it,
   and Esc, focus trapping and an inert page behind come for free. */
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
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  open(index: number): void {
    this.activeIndex.set(index);
    this.dialog().nativeElement.showModal();
  }

  close(): void {
    this.dialog().nativeElement.close();
  }

  /* fires for every way of closing: the × button, Esc, a click outside the picture */
  onClosed(): void {
    this.activeIndex.set(null);
  }

  /* a click that lands on the dialog itself (the dimmed area), not on its content */
  onDialogClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.close();
  }

  select(index: number): void {
    this.activeIndex.set(index);
  }

  navigate(direction: 1 | -1): void {
    if (this.images.length <= 1) {
      return;
    }
    const current = this.activeIndex() ?? 0;
    this.activeIndex.set((current + direction + this.images.length) % this.images.length);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') this.navigate(1);
    if (event.key === 'ArrowLeft') this.navigate(-1);
  }
}
