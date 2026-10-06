import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export const COLORS = {
  red: '#E0312B',
  orange: '#F28C1B',
  yellow: '#F7D31E',
  green: '#2E9E48',
  blue: '#2667D9',
  purple: '#8A3FC4',
  pink: '#F27BB3',
  brown: '#8B5A2B',
} as const;
export type ColorKey = keyof typeof COLORS;

/* g = grammatical gender of the Ukrainian noun, so the colour word can agree with it */
export const SHAPES = {
  circle: { g: 'n' },
  square: { g: 'm' },
  triangle: { g: 'm' },
  star: { g: 'f' },
  heart: { g: 'n' },
  rhombus: { g: 'm' },
} as const;
export type ShapeKey = keyof typeof SHAPES;
export const SHAPE_KEYS = Object.keys(SHAPES) as ShapeKey[];

export const INK = '#16243C';

const STAR = (() => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 20 : 47;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push((50 + r * Math.cos(a)).toFixed(1) + ',' + (54 + r * Math.sin(a)).toFixed(1));
  }
  return pts.join(' ');
})();

const HEART = 'M50 90 C22 70 5 52 5 32 C5 17 17 7 30 7 C40 7 47 13 50 21 C53 13 60 7 70 7 C83 7 95 17 95 32 C95 52 78 70 50 90Z';

/* A shape filled with a colour; colour null draws an empty outline to colour in. */
@Component({
  selector: 'app-shape',
  standalone: true,
  template: `
    <svg viewBox="0 0 100 100" [style.width.mm]="mm()" [style.height.mm]="mm()">
      @switch (shape()) {
        @case ('circle') {
          <circle cx="50" cy="50" r="43" [attr.fill]="fill()" [attr.stroke]="ink" [attr.stroke-width]="strokeWidth()" stroke-linejoin="round" />
        }
        @case ('square') {
          <rect x="9" y="9" width="82" height="82" rx="5" [attr.fill]="fill()" [attr.stroke]="ink" [attr.stroke-width]="strokeWidth()" stroke-linejoin="round" />
        }
        @case ('triangle') {
          <polygon points="50,7 95,90 5,90" [attr.fill]="fill()" [attr.stroke]="ink" [attr.stroke-width]="strokeWidth()" stroke-linejoin="round" />
        }
        @case ('star') {
          <polygon [attr.points]="star" [attr.fill]="fill()" [attr.stroke]="ink" [attr.stroke-width]="strokeWidth()" stroke-linejoin="round" />
        }
        @case ('heart') {
          <path [attr.d]="heart" [attr.fill]="fill()" [attr.stroke]="ink" [attr.stroke-width]="strokeWidth()" stroke-linejoin="round" />
        }
        @case ('rhombus') {
          <polygon points="50,5 95,50 50,95 5,50" [attr.fill]="fill()" [attr.stroke]="ink" [attr.stroke-width]="strokeWidth()" stroke-linejoin="round" />
        }
      }
    </svg>
  `,
  styles: `
    :host { display: contents; }
    svg { display: block; flex: none; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShapeComponent {
  readonly shape = input.required<ShapeKey>();
  readonly color = input<ColorKey | null>(null);
  readonly mm = input(15);

  readonly ink = INK;
  readonly star = STAR;
  readonly heart = HEART;
  readonly fill = computed(() => {
    const c = this.color();
    return c ? COLORS[c] : '#fff';
  });
  readonly strokeWidth = computed(() => (this.color() ? 3 : 4));
}
