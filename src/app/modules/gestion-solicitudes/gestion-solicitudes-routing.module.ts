import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestionComponent } from './pages/gestion/gestion.component';
import { BuzonComponent } from './components/gestion-coordinacion/buzon/buzon.component';
import { SelectorComponent } from './components/presentacion-solicitudes/selector/selector.component';
import { ContenedorPasosComponent } from './components/presentacion-solicitudes/contenedorpasos/contenedorpasos.component';
import { DocsAdjuntosComponent } from './components/presentacion-solicitudes/docsadjuntos/docsadjuntos.component';
import { ResumenComponent } from './components/presentacion-solicitudes/resumen/ResumenComponent';
import { VisorComponent } from './components/gestion-coordinacion/visor/visor.component';
import { BuzondeavalesComponent } from './components/aval-tutores-directores/buzondeavales/buzondeavales.component';
import { PendientesavalComponent } from './components/aval-tutores-directores/pendientesaval/pendientesaval.component';
import { FormulariosComponent } from './components/presentacion-solicitudes/formularios/formularios.component';

const routes: Routes = [
    {
        path: '',
        component: GestionComponent,
        children: [
            { path: 'buzon', component: BuzonComponent },
            { path: 'visor', component: VisorComponent },
        ],
    },
    {
        path: 'creacion',
        component: ContenedorPasosComponent,
        children: [
            { path: 'selector', component: SelectorComponent },
            { path: 'datos', component: FormulariosComponent },
            { path: 'documentos', component: DocsAdjuntosComponent },
            { path: 'resumen', component: ResumenComponent },
        ],
    },
    {
        path: 'avales',
        component: BuzondeavalesComponent,
        children: [{ path: 'pendientes', component: PendientesavalComponent }],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GestionSolicitudesRoutingModule {}
