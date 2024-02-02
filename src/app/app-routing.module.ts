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
                            path: 'estudiantes',
                            loadChildren: () =>
                                import(
                                    './modules/gestion-estudiantes/gestion-estudiantes.module'
                                ).then((m) => m.GestionEstudiantesModule),
                        },
                        {
                            path: 'docentes',
                            loadChildren: () =>
                                import(
                                    './modules/gestion-docentes/gestion-docentes.module'
                                ).then((m) => m.GestionDocentesModule),
                        },
                        {
                            path: 'gestion-asignaturas',
                            loadChildren: () =>
                                import(
                                    './modules/gestion-asignaturas/gestion-asignaturas.module'
                                ).then((m) => m.GestionAsignaturasModule)
                        },
                        {
                            path: 'gestion-documentos',
                            loadChildren: () =>
                                import(
                                    './modules/gestion-documentos/gestion-documentos.module'
                                ).then((m) => m.GestionDocumentosModule)
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
