import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'cv', loadComponent: () => import('./pages/cv/cv.component').then((m) => m.CvComponent) },
  { path: 'kid-tasks', loadChildren: () => import('./pages/kid-tasks/kid-tasks.routes').then((m) => m.KID_TASKS_ROUTES) },
  { path: '**', redirectTo: '' },
];
