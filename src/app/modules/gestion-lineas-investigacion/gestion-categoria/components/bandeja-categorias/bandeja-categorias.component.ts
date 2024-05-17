import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BreadcrumbService } from 'src/app/core/components/breadcrumb/app.breadcrumb.service';
import { Categoria } from '../../models/categoria';

@Component({
  selector: 'app-bandeja-categorias',
  templateUrl: './bandeja-categorias.component.html',
  styleUrls: ['./bandeja-categorias.component.scss']
})
export class BandejaCategoriasComponent implements OnInit {

  visible: boolean = false;
  categorias: Categoria[] = [];
  loading: boolean;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private messageService: MessageService,
    private router: Router,
    private confirmationService: ConfirmationService
    //servicio
  ) { }

  ngOnInit():void {
    this.setBreadcrumb();
  }

  setBreadcrumb() {
    this.breadcrumbService.setItems([
        { label: 'Gestión' },
        { label: 'Categorias' },
    ]);
}

showDialog() {
    this.visible = true;
}

}
