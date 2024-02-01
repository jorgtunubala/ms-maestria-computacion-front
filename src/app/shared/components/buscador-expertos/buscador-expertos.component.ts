import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ExpertoService } from '../../services/experto.service';
import { Experto } from '../../../modules/examen-de-valoracion/models/experto';

@Component({
    selector: 'app-buscador-expertos',
    templateUrl: './buscador-expertos.component.html',
    styleUrls: ['./buscador-expertos.component.scss'],
})
export class BuscadorExpertosComponent implements OnInit {
    expertos: Experto[] = [
        {
            id: 1,
            estado: 'Activo',
            persona: {
                id: 101,
                identificacion: 123456789,
                nombre: 'María',
                apellido: 'Gómez',
                correoElectronico: 'maria.gomez@example.com',
                telefono: '987-654-3210',
                genero: 'Femenino',
                tipoIdentificacion: 'Cédula',
            },
            codigo: 'EXP001',
            facultad: 'Facultad de Ingeniería',
            departamento: 'Departamento de Ingeniería Eléctrica',
            escalafon: 'Investigador Asociado',
            observacion: 'Experto en energías renovables',
            lineasInvestigacion: [
                {
                    id: 201,
                    titulo: 'Energías Renovables',
                    categoria: 'Investigación Aplicada',
                },
                {
                    id: 202,
                    titulo: 'Eficiencia Energética',
                    categoria: 'Investigación Aplicada',
                },
            ],
            tipoVinculacion: 'Tiempo Completo',
            titulos: [
                {
                    id: 301,
                    abreviatura: 'Ph.D.',
                    universidad: 'Universidad XYZ',
                    categoriaMinCiencia: 'Doctor',
                },
                {
                    id: 302,
                    abreviatura: 'M.Sc.',
                    universidad: 'Universidad ABC',
                    categoriaMinCiencia: 'Maestría',
                },
            ],
        },
        // Otros cinco expertos con datos ficticios similares...
    ];
    expertoSeleccionado: Experto;
    loading: boolean;

    constructor(
        private expertoService: ExpertoService,
        private ref: DynamicDialogRef,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.listExpertos();
    }

    listExpertos() {
        this.loading = true;
        this.expertoService
            .listExpertos()
            .subscribe({
                next: (response) =>
                    (this.expertos = this.getExpertosActivos(response)),
            })
            .add(() => (this.loading = false));
    }

    filterExpertos(filter: string) {
        if (filter?.trim()) {
            this.loading = true;
            this.expertoService
                .filterExpertos(filter)
                .subscribe({
                    next: (response) =>
                        (this.expertos = this.getExpertosActivos(response)),
                })
                .add(() => (this.loading = false));
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
