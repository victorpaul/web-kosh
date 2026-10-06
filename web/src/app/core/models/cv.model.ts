/* The CV as structured data (`public/data/cv.json`, English only).
   Layouts and section variants are built on this, so keep it data, not prose blocks. */

export interface CvLink {
  label: string;
  url: string;
}

export type CvContactKind = 'telegram' | 'email' | 'location' | 'website' | 'linkedin';

export interface CvContact {
  kind: CvContactKind;
  label: string;
  url?: string;
}

export interface CvExperience {
  company: string;
  url?: string;
  /* "YYYY-MM", or "YYYY" when the month is unknown (then no duration is shown) */
  start: string;
  /* null = current job */
  end: string | null;
  roles: string[];
  links?: CvLink[];
  responsibilities: string[];
  /* short list of technologies used there; drives skill highlighting and the skill cloud */
  stack: string[];
}

export interface CvProject {
  title: string;
  /* may contain inline <strong> */
  paragraphs: string[];
  links?: CvLink[];
}

export interface CvSkill {
  name: string;
  /* shown in the short skills list (sidebar); everything shows in the full list */
  core?: boolean;
}

export interface CvSkillGroup {
  name: string;
  skills: CvSkill[];
}

export interface CvLanguage {
  name: string;
  level: string;
}

export interface Cv {
  name: string;
  title: string;
  note?: string;
  contacts: CvContact[];
  about: string[];
  ai: { title: string; paragraphs: string[] };
  experience: CvExperience[];
  projects: { intro: string; items: CvProject[]; languages: string[] };
  summary: string[];
  skillGroups: CvSkillGroup[];
  domains: string[];
  softSkills: string[];
  languages: CvLanguage[];
  hobbies: string[];
}
