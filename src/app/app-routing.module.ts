import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AppMainComponent } from './core/components/main/app.main.component';
import { ErrorComponent } from './core/components/error/error.component';
import { NotfoundComponent } from './core/components/notfound/notfound.component';
import { AccessComponent } from './core/components/access/access.component';
import { HomeComponent } from './core/components/home/home.component';
@NgModule({
    imports: [
        RouterModule.forRoot(
            [
                {
                    path: '',
                    component: AppMainComponent,
                    children: [
                        { path: '', component: HomeComponent },
                        {
                            path: 'examen-de-valoracion',
                            loadChildren: () =>
                                import(
                                    './modules/examen-de-valoracion/examen-de-valoracion.module'
                                ).then((m) => m.ExamenDeValoracionModule),
                        },
                        {
                            path: 'gestionsolicitudes',
                            loadChildren: () =>
                                import(
                                    './modules/gestion-solicitudes/gestion-solicitudes.module'
                                ).then((m) => m.GestionSolicitudesModule),
                        },
                    ],
                },
                { path: 'pages/error', component: ErrorComponent },
                { path: 'pages/notfound', component: NotfoundComponent },
                { path: 'pages/access', component: AccessComponent },
                { path: '**', redirectTo: 'pages/notfound' },
            ],
            { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }
        ),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
