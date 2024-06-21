import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { GestionSolicitudesRoutingModule } from './gestion-solicitudes-routing.module';
import { PrimenNgModule } from '../primen-ng/primen-ng.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { GestionComponent } from './pages/gestion/gestion.component';
import { BuzonComponent } from './components/gestion-coordinacion/buzon/buzon.component';
import { SelectorComponent } from './components/presentacion-solicitudes/selector/selector.component';

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
import { PasantiainvestComponent } from './components/presentacion-solicitudes/formularios/complementarios/pasantiainvest/pasantiainvest.component';
import { ApyeconomicoestanciaComponent } from './components/presentacion-solicitudes/formularios/complementarios/apyeconomicoestancia/apyeconomicoestancia.component';
import { ListadirectoresComponent } from './components/presentacion-solicitudes/formularios/complementarios/listadirectores/listadirectores.component';
import { HistorialComponent } from './components/seguimiento-solicitudes/historial/historial.component';
import { PortafolioComponent } from './pages/portafolio/portafolio.component';
import { OpcionesComponent } from './pages/opciones/opciones.component';
import { ApyasistenciaeventoComponent } from './components/presentacion-solicitudes/formularios/complementarios/apyasistenciaevento/apyasistenciaevento.component';
import { ApypublicacionComponent } from './components/presentacion-solicitudes/formularios/complementarios/apypublicacion/apypublicacion.component';
import { ContenedorComponent } from './components/gestion-coordinacion/contenedor/contenedor.component';
import { TramiteComponent } from './components/gestion-coordinacion/tramite/tramite.component';
import { CreditosComponent } from './components/presentacion-solicitudes/formularios/complementarios/creditos/creditos.component';
import { AvalpracticadocenteComponent } from './components/presentacion-solicitudes/formularios/complementarios/avalpracticadocente/avalpracticadocente.component';

@NgModule({
    declarations: [
        GestionComponent,
        BuzonComponent,
        SelectorComponent,
        FormulariosComponent,
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
        PasantiainvestComponent,
        ApyeconomicoestanciaComponent,
        ListadirectoresComponent,
        HistorialComponent,

        PortafolioComponent,
        OpcionesComponent,
        ApyasistenciaeventoComponent,
        ApypublicacionComponent,
        ContenedorComponent,
        TramiteComponent,
        CreditosComponent,
        AvalpracticadocenteComponent,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        PrimenNgModule,
        SharedModule,
        GestionSolicitudesRoutingModule,
    ],
    providers: [DatePipe],
})
export class GestionSolicitudesModule {}
