import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GestionCertificadoVotacionRoutingModule } from './gestion-certificado-votacion-routing.module';
import { TramiteCertificadoComponent } from './components/tramitecertificado/tramitecertificado.component';
import { TableModule } from 'primeng/table';

@NgModule({
  declarations: [
    TramiteCertificadoComponent
  ],
  imports: [
    CommonModule,
    TableModule,
    GestionCertificadoVotacionRoutingModule
  ]
})
export class GestionCertificadoVotacionModule { }
