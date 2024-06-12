import { NgModule } from '@angular/core';
import { PrincipalGestionCustionarioComponent } from './pages/principal-gestion-custionario/principal-gestion-custionario.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'primeng/api';
import { PrimenNgModule } from '../../primen-ng/primen-ng.module';
import { ReactiveFormsModule } from '@angular/forms';
import { GestionCuestionariosRoutingModule } from './gestion-cuestionarios-routing.module';
import { AgregarPreguntaCuestionarioComponent } from './components/agregar-pregunta-cuestionario/agregar-pregunta-cuestionario.component';

@NgModule({
    declarations: [
        PrincipalGestionCustionarioComponent,
        AgregarPreguntaCuestionarioComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        PrimenNgModule,
        GestionCuestionariosRoutingModule,
        ReactiveFormsModule,
    ],
})
export class GestionCuestionariosModule {}
