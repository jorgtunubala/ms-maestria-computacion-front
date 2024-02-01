import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GestionSolicitudesRoutingModule } from './gestion-solicitudes-routing.module';
import { PrimenNgModule } from '../primen-ng/primen-ng.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { GestionComponent } from './pages/gestion/gestion.component';
import { BuzonComponent } from './components/buzon/buzon.component';
import { SelectorComponent } from './components/selector/selector.component';
import { CreadorComponent } from './components/creador/creador.component';
import { DocumentosComponent } from './components/documentos/documentos.component';
import { ResumenComponent } from './components/resumen/ResumenComponent';
import { VisorComponent } from './components/visor/visor.component';
import { DatosComponent } from './components/datos/datos.component';
import { AsignaturahomologarComponent } from './components/asignaturahomologar/asignaturahomologar.component';
import { PlantillasComponent } from './components/plantillas/plantillas.component';
import { FirmaelectronicaComponent } from './components/firmaelectronica/firmaelectronica.component';
import { BuzondeavalesComponent } from './components/buzondeavales/buzondeavales.component';
import { PendientesavalComponent } from './components/pendientesaval/pendientesaval.component';
import { VisoravalComponent } from './components/visoraval/visoraval.component';
import { AsignaturaexternaComponent } from './components/asignaturaexterna/asignaturaexterna.component';

@NgModule({
    declarations: [
        GestionComponent,
        BuzonComponent,
        SelectorComponent,
        DatosComponent,
        CreadorComponent,
        DocumentosComponent,
        ResumenComponent,
        VisorComponent,
        AsignaturahomologarComponent,
        PlantillasComponent,
        FirmaelectronicaComponent,
        BuzondeavalesComponent,
        PendientesavalComponent,
        VisoravalComponent,
        AsignaturaexternaComponent,
    ],
    imports: [
        CommonModule,
        PrimenNgModule,
        SharedModule,
        GestionSolicitudesRoutingModule,
    ],
})
export class GestionSolicitudesModule {}
