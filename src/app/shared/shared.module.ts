import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimenNgModule } from '../modules/primen-ng/primen-ng.module';
import { EmptyLabelPipe } from './pipes/empty-label.pipe';
import { BuscadorDocentesComponent } from './components/buscador-docentes/buscador-docentes.component';
import { BuscadorEstudiantesComponent } from './components/buscador-estudiantes/buscador-estudiantes.component';
import { BuscarExpertosComponent } from './components/buscar-expertos/buscar-expertos.component';



@NgModule({
  declarations: [
    EmptyLabelPipe,
    BuscadorDocentesComponent,
    BuscadorEstudiantesComponent,
    BuscarExpertosComponent
  ],
  imports: [
    CommonModule,
    PrimenNgModule
  ],
  exports: [
    EmptyLabelPipe,
    BuscadorDocentesComponent,
    BuscadorEstudiantesComponent,
    BuscarExpertosComponent,
  ]
})
export class SharedModule { }
