import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';
import { MainLayout } from './layout/main-layout';
import { DashboardPage } from './features/dashboard/dashboard-page';
import { LoginPage } from './features/auth/login-page';
import { SensoresPage } from './features/sensores/sensores-page';
import { UsuariosPage } from './features/usuarios/usuarios-page';
import { ComunidadesPage } from './features/comunidades/comunidades-page';
import { UmbralesPage } from './features/umbrales/umbrales-page';
import { BitacoraPage } from './features/bitacora/bitacora-page';

export const routes: Routes = [

  /* El inicio de sesión va FUERA del marco: no debe mostrar el menú
     lateral ni el encabezado, porque todavía no hay sesión. */
  { path: 'login', component: LoginPage },

  /* Todo lo demás vive dentro del marco y exige haber entrado.
     canActivate se evalúa ANTES de construir la pantalla. */
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'panel', pathMatch: 'full' },
      { path: 'panel', component: DashboardPage },
      { path: 'sensores', component: SensoresPage },
      { path: 'comunidades', component: ComunidadesPage },
      { path: 'usuarios', component: UsuariosPage },
      { path: 'umbrales', component: UmbralesPage },

      // La bitácora solo la puede ver el Administrador (regla RN-019).
      // adminGuard lo comprueba; si no es admin, lo manda al panel.
      { path: 'bitacora', component: BitacoraPage, canActivate: [adminGuard] }
    ]
  },

  { path: '**', redirectTo: '' }
];
