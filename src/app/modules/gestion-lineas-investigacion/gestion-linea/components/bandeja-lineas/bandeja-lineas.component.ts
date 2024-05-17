import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BreadcrumbService } from 'src/app/core/components/breadcrumb/app.breadcrumb.service';

@Component({
  selector: 'app-bandeja-lineas',
  templateUrl: './bandeja-lineas.component.html',
  styleUrls: ['./bandeja-lineas.component.scss']
})
export class BandejaLineasComponent implements OnInit {

  constructor(
    private breadcrumbService: BreadcrumbService,
    private messageService: MessageService,
    private router: Router,
    private confirmationService: ConfirmationService
    //servicio
  ) { }

  ngOnInit() {
    this.setBreadcrumb();
  }

  setBreadcrumb() {
    this.breadcrumbService.setItems([
        { label: 'Gestión' },
        { label: 'Lineas' },
    ]);
}

}
