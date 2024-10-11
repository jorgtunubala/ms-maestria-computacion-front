import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NombreDelComponente1Component } from './components/nombre-del-componente1/nombre-del-componente1.component';
import { NombreDelComponente2Component } from './components/nombre-del-componente2/nombre-del-componente2.component';

const routes: Routes = [{
  path: '',
  component: NombreDelComponente1Component,
},

{
  path: 'componente2',
  component: NombreDelComponente2Component,
},];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestionCertificadoVotacionRoutingModule { }
