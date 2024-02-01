import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExamenDeValoracionRoutingModule } from './examen-de-valoracion-routing.module';
import { PrimenNgModule } from '../primen-ng/primen-ng.module';

import { ReactiveFormsModule } from '@angular/forms';
import { PrincipalExamenDeValoracionComponent } from './pages/principal-examen-de-valoracion/principal-examen-de-valoracion.component';
import { BandejaExamenDeValoracionComponent } from './components/bandeja-examen/bandeja-examen-de-valoracion.component';
import { SolicitudService } from './services/solicitud.service';
import { CrearSolicitudExamenComponent } from './components/crear-solicitud-examen/crear-solicitud-examen.component';
import { SolicitudExamenComponent } from './components/solicitud-examen/solicitud-examen.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
    declarations: [
        PrincipalExamenDeValoracionComponent,
        BandejaExamenDeValoracionComponent,
        CrearSolicitudExamenComponent,
        SolicitudExamenComponent,
    ],
    imports: [
        CommonModule,
        PrimenNgModule,
        SharedModule,
        ExamenDeValoracionRoutingModule,
        ReactiveFormsModule,
    ],
    providers: [SolicitudService],
})
export class ExamenDeValoracionModule {}
