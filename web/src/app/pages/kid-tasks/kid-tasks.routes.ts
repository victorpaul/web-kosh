import { Routes } from '@angular/router';

/* Kid tasks (worksheets): lazy-loaded, so the main site does not pay for them. */
export const KID_TASKS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./home/kid-tasks-home.component').then((m) => m.KidTasksHomeComponent) },
  { path: 'writing', loadComponent: () => import('./writing/writing.component').then((m) => m.WritingComponent) },
  { path: 'math', loadComponent: () => import('./math/math.component').then((m) => m.MathComponent) },
  { path: 'colors', loadComponent: () => import('./colors/colors.component').then((m) => m.ColorsComponent) },
  { path: 'words', loadComponent: () => import('./words/words.component').then((m) => m.WordsComponent) },
  { path: 'paths', loadComponent: () => import('./paths/paths.component').then((m) => m.PathsComponent) },
  { path: 'papers', loadComponent: () => import('./papers/papers.component').then((m) => m.PapersComponent) },
];
