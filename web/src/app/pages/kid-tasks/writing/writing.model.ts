export const FONTS = { kid: 'var(--kid)', round: 'var(--display)', plain: 'var(--ui)' } as const;
export type FontKey = keyof typeof FONTS;
export const FONT_KEYS = Object.keys(FONTS) as FontKey[];

export const STYLE_KEYS = ['solid', 'faded', 'outline', 'dotted'] as const;
export type TextStyleKey = (typeof STYLE_KEYS)[number];

export const RATIOS = { landscape: '4 / 3', portrait: '3 / 4', square: '1 / 1' } as const;
export type RatioKey = keyof typeof RATIOS;
export const RATIO_KEYS = Object.keys(RATIOS) as RatioKey[];

export interface TextBlock {
  kind: 'text';
  text: string;
  font: FontKey;
  size: number;
  bold: boolean;
  style: TextStyleKey;
  /* how visible trace letters are, 0.05–1 */
  fade?: number;
}
export interface ImageBlock {
  kind: 'image';
  img: string | null;
  ratio: RatioKey;
}
export interface LinesBlock {
  kind: 'lines';
  count: number;
}
export type Block = TextBlock | ImageBlock | LinesBlock;
export type BlockKind = Block['kind'];

export interface Cell {
  wide: boolean;
  blocks: Block[];
}

export interface WritingSheet {
  title: string;
  cols: number;
  rows: number;
  size: 'a4' | 'letter';
  cells: Cell[];
}

export const newText = (patch: Partial<TextBlock> = {}): TextBlock => ({
  kind: 'text', text: '', font: 'kid', size: 24, bold: true, style: 'solid', ...patch,
});
export const newImage = (): ImageBlock => ({ kind: 'image', img: null, ratio: 'landscape' });
export const newLines = (count = 3): LinesBlock => ({ kind: 'lines', count });
export const newBlock = (kind: BlockKind): Block =>
  kind === 'text' ? newText() : kind === 'image' ? newImage() : newLines();

/* a fresh sheet with sample cards; `t` translates the sample text into the current language */
export function blankSheet(t: (key: string) => string): WritingSheet {
  return {
    title: t('w.default.title'),
    cols: 2,
    rows: 3,
    size: 'a4',
    cells: [
      { wide: false, blocks: [newText({ text: t('w.default.letters1'), size: 36 }), newLines()] },
      { wide: false, blocks: [newText({ text: t('w.default.letters2'), size: 36 }), newLines()] },
      { wide: false, blocks: [newImage(), newText({ text: t('w.default.home'), size: 18 }), newLines(1)] },
      { wide: false, blocks: [newImage(), newText({ text: t('w.default.cat'), size: 18 }), newLines(1)] },
      { wide: false, blocks: [newText({ text: t('w.default.family'), size: 14, font: 'plain', bold: false })] },
      { wide: false, blocks: [newText({ text: t('w.default.name'), size: 14, font: 'plain', bold: false }), newLines(2)] },
    ],
  };
}

/* the printed look of a text block: solid, or faint letters to trace over */
export function textBlockStyle(block: TextBlock): Record<string, string> {
  const style = block.style || 'solid';
  const css: Record<string, string> = {
    'font-family': style === 'dotted' ? 'var(--dots)' : FONTS[block.font],
    'font-size': `${block.size}pt`,
    'font-weight': block.bold ? '700' : '400',
  };
  if (style !== 'solid') {
    const fade = block.fade ?? 0.2;
    if (style === 'outline') {
      css['color'] = 'transparent';
      css['-webkit-text-stroke'] = `${Math.max(0.6, block.size / 34)}px rgba(22,36,60,${Math.min(1, fade * 2.5)})`;
    } else {
      css['color'] = `rgba(22,36,60,${fade})`;
      if (style === 'dotted') css['font-weight'] = '400';
    }
  }
  return css;
}
