import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';
import { routes } from './app.routes';

/**
 * La raíz es solo un marco: delega todo en el router. El comportamiento que importa a nivel de
 * aplicación es que las rutas privadas no se muestren sin sesión y lleven a /login recordando el destino.
 * (Antes este archivo esperaba el texto de plantilla de Angular CLI "Hello, climguard-web".)
 */
describe('App', () => {
  beforeEach(async () => {
    sessionStorage.clear(); // sin sesión guardada (AuthService la lee de sessionStorage)
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  afterEach(() => sessionStorage.clear());

  it('se crea', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('es un marco que delega en el router (sin contenido propio)', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const raiz = fixture.nativeElement as HTMLElement;
    expect(raiz.querySelector('router-outlet')).not.toBeNull();
    expect(raiz.querySelector('h1')).toBeNull();
  });

  it('sin sesión, una ruta privada redirige a /login conservando el destino', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/sensores');
    expect(TestBed.inject(Router).url).toBe('/login?destino=%2Fsensores');
  });

  it('sin sesión, la raíz también lleva a /login', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');
    expect(TestBed.inject(Router).url).toMatch(/^\/login/);
  });
});
