import { Routes } from '@angular/router';
import { authGuard, adminGuard, permisoGuard } from './core/guards/auth.guard';
import { MainLayout } from './layout/main-layout';
import { DashboardPage } from './features/dashboard/dashboard-page';
import { LoginPage } from './features/auth/login-page';
import { SensoresPage } from './features/sensores/sensores-page';
import { UsuariosPage } from './features/usuarios/usuarios-page';
import { ComunidadesPage } from './features/comunidades/comunidades-page';
import { ReglasPage } from './features/reglas/reglas-page';
import { BitacoraPage } from './features/bitacora/bitacora-page';
import { AlertasPage } from './features/alertas/alertas-page';
import { HistorialPage } from './features/historial/historial-page';
import { FenomenosPage } from './features/fenomenos/fenomenos-page';

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
      // Carga diferida: el mapa y su librería (Leaflet) solo se descargan
      // cuando el usuario entra a /mapa, para no pesar en la carga inicial.
      { path: 'mapa', loadComponent: () => import('./features/mapa/mapa-page').then(m => m.MapaPage), canActivate: [permisoGuard], data: { permiso: 'dashboard.ver' } },

      // Cada pantalla exige su permiso. El guard usa el MISMO criterio que el
      // menú y los botones (auth.puede), así nadie entra por URL directa a algo
      // que su rol no permite. (Recordatorio: el candado real es la API.)
      { path: 'sensores', component: SensoresPage, canActivate: [permisoGuard], data: { permiso: 'sensores.ver' } },
      { path: 'comunidades', component: ComunidadesPage, canActivate: [permisoGuard], data: { permiso: 'comunidades.ver' } },
      { path: 'usuarios', component: UsuariosPage, canActivate: [permisoGuard], data: { permiso: 'usuarios.gestionar' } },
      { path: 'reglas', component: ReglasPage, canActivate: [permisoGuard], data: { permiso: 'reglas.ver' } },
      { path: 'alertas', component: AlertasPage, canActivate: [permisoGuard], data: { permiso: 'alertas.ver' } },
      { path: 'historial', component: HistorialPage, canActivate: [permisoGuard], data: { permiso: 'alertas.ver' } },
      { path: 'fenomenos', component: FenomenosPage, canActivate: [permisoGuard], data: { permiso: 'fenomenos.gestionar' } },

      // La bitácora solo la puede ver el Administrador (regla RN-019).
      // adminGuard lo comprueba; si no es admin, lo manda al panel.
      { path: 'bitacora', component: BitacoraPage, canActivate: [adminGuard] }
    ]
  },

  { path: '**', redirectTo: '' }
];
