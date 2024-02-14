import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService, PrimeIcons } from 'primeng/api';
import { BreadcrumbService } from 'src/app/core/components/breadcrumb/app.breadcrumb.service';
import { Mensaje } from 'src/app/core/enums/enums'
import { infoMessage } from 'src/app/core/utils/message-util';
// import { Experto } from '../../models/experto';
import { ExpertoService } from '../../services/experto.service';
import { Experto } from '../../models/experto';

@Component({
  selector: 'app-bandeja-expertos',
  templateUrl: './bandeja-expertos.component.html',
  styleUrls: ['./bandeja-expertos.component.scss']
})
export class BandejaExpertosComponent implements OnInit {

  loading: boolean;
  expertos: Experto[] = [];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private expertoService: ExpertoService,
    private messageService: MessageService,
    private router: Router,
    private confirmationService: ConfirmationService,) 
    {}

ngOnInit() {
  this.setBreadcrumb();
  // this.listExpertos();
}

setBreadcrumb() {
  this.breadcrumbService.setItems([
    { label: 'Gestión' },
    { label: 'Expertos' },
  ]);
}

listExpertos() {
  this.loading = true;
  this.expertoService.listExpertos().subscribe({
    next: (response) => this.expertos = response.filter((d) => d.estado === 'ACTIVO'),
  }).add(() => this.loading = false);
}

onRegistrarExperto() {
  this.router.navigate(['expertos/registrar']);
}

onCargaExitosa() {
  this.listExpertos();
}


}
