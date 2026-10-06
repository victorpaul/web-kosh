import { LocalizedText } from '../i18n/i18n.service';

export type TimelineItemType = 'work' | 'personal';

/* Text fields are either language-neutral strings (years, company links) or `{ en, uk }` pairs. */
export interface TimelineItem {
  date: LocalizedText;
  title: LocalizedText;
  description?: LocalizedText[];
  type: TimelineItemType;
  images?: string[];
}

export interface TimelineData {
  timelineItems: TimelineItem[];
}
