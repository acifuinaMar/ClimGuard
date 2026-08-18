import { Routes } from '@angular/router';
import { SensoresPage } from './features/sensores/sensores-page';

export const routes: Routes = [
  { path: '', redirectTo: 'sensores', pathMatch: 'full' },
  { path: 'sensores', component: SensoresPage }
];