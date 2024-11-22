import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GestionCertificadoVotacionRoutingModule } from './gestion-certificado-votacion-routing.module';
import { TramitecertificadoComponent } from './components/tramitecertificado/tramitecertificado.component';


@NgModule({
  declarations: [
    TramitecertificadoComponent
  ],
  imports: [
    CommonModule,
    GestionCertificadoVotacionRoutingModule
  ]
})
export class GestionCertificadoVotacionModule { }
