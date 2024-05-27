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

  categorias: Categoria[] = [];
  loading: boolean = false;
  displayDialog: boolean = false;
  categoria: Categoria = { nombre: '', observacion: '' };
  isNew: boolean = true;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private messageService: MessageService,
    private router: Router,
    private confirmationService: ConfirmationService
    //servicio
  ) { }

  ngOnInit(): void {
    this.loadCategorias();
  }

  loadCategorias() {
    // this.loading = true;
    // this.categoriaService.getCategorias().subscribe(data => {
    //   this.categorias = data;
    //   this.loading = false;
    // });
  }

  showDialog() {
    this.categoria = { nombre: '', observacion: '' };
    this.isNew = true;
    this.displayDialog = true;
  }

  onEditar(id: number) {
    // this.categoriaService.getCategoria(id).subscribe(data => {
    //   this.categoria = { ...data };
    //   this.isNew = false;
    //   this.displayDialog = true;
    // });
  }

  onSave() {
    // if (this.isNew) {
    //   this.categoriaService.addCategoria(this.categoria).subscribe(data => {
    //     this.categorias.push(data);
    //     this.displayDialog = false;
    //   });
    // } else {
    //   this.categoriaService.updateCategoria(this.categoria).subscribe(data => {
    //     const index = this.categorias.findIndex(categoria => categoria.id === data.id);
    //     if (index !== -1) {
    //       this.categorias[index] = data;
    //     }
    //     this.displayDialog = false;
    //   });
    // }
  }

  onCancel() {
    this.displayDialog = false;
  }

  onDelete(event: Event, id: number) {
    // this.categoriaService.deleteCategoria(id).subscribe(() => {
    //   this.categorias = this.categorias.filter(categoria => categoria.id !== id);
    // });
  }


  setBreadcrumb() {
    this.breadcrumbService.setItems([
        { label: 'Gestión' },
        { label: 'Categorias' },
    ]);
}



}
