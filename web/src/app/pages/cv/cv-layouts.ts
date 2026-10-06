/* A layout is configuration, not a template: which sections go into which area, in what order.
   The page renders any layout; its look comes from `.layout-<id>` styles in cv.component.scss. */

export type CvSectionId =
  | 'header'
  | 'contacts'
  | 'about'
  | 'ai'
  | 'experience'
  | 'projects'
  | 'summary'
  | 'coreSkills'
  | 'allSkills'
  | 'domains'
  | 'softSkills'
  | 'languages'
  | 'hobbies';

export interface CvSlot {
  section: CvSectionId;
  /* start a new printed page before this section */
  printBreak?: boolean;
}

export interface CvLayout {
  id: string;
  name: string;
  areas: { name: string; slots: CvSlot[] }[];
}

/* Classic: the PDF look — header, sidebar + intro, then experience, projects and summary on their own pages */
export const CLASSIC: CvLayout = {
  id: 'classic',
  name: 'Classic',
  areas: [
    { name: 'top', slots: [{ section: 'header' }] },
    {
      name: 'side',
      slots: [{ section: 'contacts' }, { section: 'coreSkills' }, { section: 'softSkills' }, { section: 'languages' }, { section: 'hobbies' }],
    },
    { name: 'main', slots: [{ section: 'about' }, { section: 'ai' }] },
    {
      name: 'full',
      slots: [
        { section: 'experience', printBreak: true },
        { section: 'projects', printBreak: true },
        { section: 'summary', printBreak: true },
        { section: 'allSkills' },
        { section: 'domains' },
      ],
    },
  ],
};

export const CV_LAYOUTS: CvLayout[] = [CLASSIC];
