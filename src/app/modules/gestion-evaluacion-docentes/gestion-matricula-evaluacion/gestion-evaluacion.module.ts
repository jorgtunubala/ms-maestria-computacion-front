import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'primeng/api';
import { PrimenNgModule } from '../../primen-ng/primen-ng.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PrincipalGestionEvaluacionComponent } from './pages/principal-gestion-evaluacion/principal-gestion-evaluacion.component';
import { GestionEvaluacionRoutingModule } from './gestion-evaluacion-routing.module';
import { BandejaEvaluacionDocenteComponent } from './components/bandeja-evaluacion-docente/bandeja-evaluacion-docente.component';
import { AgregarEvaluacionComponent } from './components/agregar-evaluacion/agregar-evaluacion.component';

@NgModule({
    declarations: [
        PrincipalGestionEvaluacionComponent,
        BandejaEvaluacionDocenteComponent,
        AgregarEvaluacionComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        PrimenNgModule,
        ReactiveFormsModule,
        GestionEvaluacionRoutingModule,
    ],
})
export class GestionEvaluacionModule {}
