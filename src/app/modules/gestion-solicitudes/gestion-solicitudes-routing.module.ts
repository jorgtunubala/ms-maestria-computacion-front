import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestionComponent } from './pages/gestion/gestion.component';
import { BuzonComponent } from './components/buzon/buzon.component';
import { SelectorComponent } from './components/selector/selector.component';
import { CreadorComponent } from './components/creador/creador.component';
import { DocumentosComponent } from './components/documentos/documentos.component';
import { ResumenComponent } from './components/resumen/ResumenComponent';
import { VisorComponent } from './components/visor/visor.component';
import { DatosComponent } from './components/datos/datos.component';
import { BuzondeavalesComponent } from './components/buzondeavales/buzondeavales.component';
import { PendientesavalComponent } from './components/pendientesaval/pendientesaval.component';

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
        component: CreadorComponent,
        children: [
            { path: 'selector', component: SelectorComponent },
            { path: 'datos', component: DatosComponent },
            { path: 'documentos', component: DocumentosComponent },
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
