import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GestionCertificadoVotacionRoutingModule } from './gestion-certificado-votacion-routing.module';
import { PrimenNgModule } from '../primen-ng/primen-ng.module';
import { NombreDelComponente1Component } from './components/nombre-del-componente1/nombre-del-componente1.component';
import { NombreDelComponente2Component } from './components/nombre-del-componente2/nombre-del-componente2.component';


@NgModule({
  declarations: [
    NombreDelComponente1Component,
    NombreDelComponente2Component
  ],
  imports: [
    PrimenNgModule,
    CommonModule,
    GestionCertificadoVotacionRoutingModule
  ]
})
export class GestionCertificadoVotacionModule { }
