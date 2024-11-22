import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TramitecertificadoComponent } from './components/tramitecertificado/tramitecertificado.component';

const routes: Routes = [{
  path: '',
  component: TramitecertificadoComponent
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestionCertificadoVotacionRoutingModule { }
