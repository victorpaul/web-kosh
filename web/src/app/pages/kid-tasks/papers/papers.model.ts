export interface PapersSheet {
  template: 'pickup';
  school: string;
  director: string;
  parentGen: string;
  parent: string;
  signer: string;
  cls: string;
  phone: string;
  children: string;
  name: string;
  date: string;
  useToday: boolean;
  blankDate: boolean;
}

export type DetailField = 'school' | 'director' | 'parentGen' | 'parent' | 'signer' | 'cls' | 'phone' | 'children';

/* the "your details" inputs, in rail order; school is a textarea */
export const DETAIL_FIELDS: { key: DetailField; labelKey: string; multiline?: boolean }[] = [
  { key: 'school', labelKey: 'p.school', multiline: true },
  { key: 'director', labelKey: 'p.director' },
  { key: 'parentGen', labelKey: 'p.parentGen' },
  { key: 'parent', labelKey: 'p.parent' },
  { key: 'signer', labelKey: 'p.signer' },
  { key: 'cls', labelKey: 'p.class' },
  { key: 'phone', labelKey: 'p.phone' },
  { key: 'children', labelKey: 'p.children' },
];

export const TEMPLATES = [{ key: 'pickup' as const, nameKey: 'p.tpl.pickup', aboutKey: 'p.tpl.pickupAbout' }];

export function todayISO(): string {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}

export function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

export const defaultPaper = (): PapersSheet => ({
  template: 'pickup',
  school: 'Першого академічного ліцею міжнародних відносин ЧМТГ',
  director: '',
  parentGen: '',
  parent: '',
  signer: '',
  cls: '',
  phone: '',
  children: '',
  name: '',
  date: todayISO(),
  useToday: true,
  blankDate: false,
});
