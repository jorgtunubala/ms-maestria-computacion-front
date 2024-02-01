import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BandejaExamenDeValoracionComponent } from './components/bandeja-examen/bandeja-examen-de-valoracion.component';
import { SolicitudExamenComponent } from './components/solicitud-examen/solicitud-examen.component';
import { PrincipalExamenDeValoracionComponent } from './pages/principal-examen-de-valoracion/principal-examen-de-valoracion.component';
import { CrearSolicitudExamenComponent } from './components/crear-solicitud-examen/crear-solicitud-examen.component';

const routes: Routes = [
    {
        path: '',
        component: PrincipalExamenDeValoracionComponent,
        children: [
            {
                path: '',
                component: BandejaExamenDeValoracionComponent,
            },
            {
                path: 'solicitud',
                component: SolicitudExamenComponent,
            },
            {
                path: 'solicitud/editar/:id',
                component: SolicitudExamenComponent,
            },
            {
                path: 'solicitud/crear',
                component: CrearSolicitudExamenComponent,
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ExamenDeValoracionRoutingModule {}
