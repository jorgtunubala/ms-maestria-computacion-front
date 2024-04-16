import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { GestionSolicitudesRoutingModule } from './gestion-solicitudes-routing.module';
import { PrimenNgModule } from '../primen-ng/primen-ng.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { GestionComponent } from './pages/gestion/gestion.component';
import { BuzonComponent } from './components/gestion-coordinacion/buzon/buzon.component';
import { SelectorComponent } from './components/presentacion-solicitudes/selector/selector.component';
import { ContenedorPasosComponent } from './components/presentacion-solicitudes/contenedorpasos/contenedorpasos.component';
import { DocsAdjuntosComponent } from './components/presentacion-solicitudes/docsadjuntos/docsadjuntos.component';
import { ResumenComponent } from './components/presentacion-solicitudes/resumen/ResumenComponent';
import { VisorComponent } from './components/gestion-coordinacion/visor/visor.component';
import { FormulariosComponent } from './components/presentacion-solicitudes/formularios/formularios.component';
import { AsignaturahomologarComponent } from './components/presentacion-solicitudes/formularios/complementarios/asignaturahomologar/asignaturahomologar.component';
import { PlantillasComponent } from './components/utilidades/plantillas/plantillas.component';
import { FirmaelectronicaComponent } from './components/utilidades/firmaelectronica/firmaelectronica.component';
import { BuzondeavalesComponent } from './components/aval-tutores-directores/buzondeavales/buzondeavales.component';
import { PendientesavalComponent } from './components/aval-tutores-directores/pendientesaval/pendientesaval.component';
import { VisoravalComponent } from './components/aval-tutores-directores/visoraval/visoraval.component';
import { AsignaturaexternaComponent } from './components/presentacion-solicitudes/formularios/complementarios/asignaturaexterna/asignaturaexterna.component';
import { OficioComponent } from './components/utilidades/oficio/oficio.component';
import { AsignaturadicioncancelComponent } from './components/presentacion-solicitudes/formularios/complementarios/asignaturadicioncancel/asignaturadicioncancel.component';
import { InfopersonalComponent } from './components/presentacion-solicitudes/formularios/complementarios/infopersonal/infopersonal.component';
import { ListatutoresComponent } from './components/presentacion-solicitudes/formularios/complementarios/listatutores/listatutores.component';
import { MotivosolicitudComponent } from './components/presentacion-solicitudes/formularios/complementarios/motivosolicitud/motivosolicitud.component';
import { SemestreaplazarComponent } from './components/presentacion-solicitudes/formularios/complementarios/semestreaplazar/semestreaplazar.component';

@NgModule({
    declarations: [
        GestionComponent,
        BuzonComponent,
        SelectorComponent,
        FormulariosComponent,
        ContenedorPasosComponent,
        DocsAdjuntosComponent,
        ResumenComponent,
        VisorComponent,
        AsignaturahomologarComponent,
        PlantillasComponent,
        FirmaelectronicaComponent,
        BuzondeavalesComponent,
        PendientesavalComponent,
        VisoravalComponent,
        AsignaturaexternaComponent,
        OficioComponent,
        AsignaturadicioncancelComponent,
        InfopersonalComponent,
        ListatutoresComponent,
        MotivosolicitudComponent,
        SemestreaplazarComponent,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        PrimenNgModule,
        SharedModule,
        GestionSolicitudesRoutingModule,
    ],
})
export class GestionSolicitudesModule {}
