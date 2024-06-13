import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrincipalGestionCustionarioComponent } from './pages/principal-gestion-custionario/principal-gestion-custionario.component';

import { AgregarPreguntaCuestionarioComponent } from './components/agregar-pregunta-cuestionario/agregar-pregunta-cuestionario.component';
import { BandejaCuestionariosComponent } from './components/bandeja-cuestionarios/bandeja-cuestionarios.component';

const routes: Routes = [
    {
        path: '',
        component: PrincipalGestionCustionarioComponent,
        children: [
            {
                path: '',
                component: BandejaCuestionariosComponent,
            },
            {
                path: 'agregar-pregunta/:id',
                component: AgregarPreguntaCuestionarioComponent,
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GestionCuestionariosRoutingModule {}
