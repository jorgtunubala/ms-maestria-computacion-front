import { Component, OnInit } from '@angular/core';
import { Experto } from 'src/app/modules/gestion-expertos/models/experto';
import { ExpertoService } from '../../services/experto.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-buscar-expertos',
  templateUrl: './buscar-expertos.component.html',
  styleUrls: ['./buscar-expertos.component.scss']
})
export class BuscarExpertosComponent implements OnInit {

  expertos: Experto[];
  expertoSeleccionado: Experto;
  loading: boolean;

  constructor(
    private expertoService: ExpertoService,
    private ref: DynamicDialogRef,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.listExpertos();
  }

  listExpertos() {
    this.loading = true;
    this.expertoService.listDocentes().subscribe({
      next: (response) => (this.expertos = this.getExpertosActivos(response)),
    })
      .add(() => this.loading = false);
  }

  filterExpertos(filter: string) {
    if (filter?.trim()) {
      this.loading = true;
      this.expertoService.filterExpertos(filter).subscribe({
        next: (response) => (this.expertos = this.getExpertosActivos(response)),
      })
        .add(() => this.loading = false);
    } else {
      this.listExpertos();
    }
    this.expertoSeleccionado = null;

  }

  getExpertosActivos(expertos: Experto[]) {
    return expertos.filter((d) => d.estado === 'ACTIVO');
  }

  onCancel() {
    this.ref.close();
  }

  onSeleccionar() {
    if (this.expertoSeleccionado) {
      this.ref.close(this.expertoSeleccionado);
    }
  }

  onRegistrar() {
    this.ref.close();
    this.router.navigate(['expertos/registrar']);
  }

}
