import { Component, OnInit } from '@angular/core';
import { Docente } from '../../models/docente';
import { DocenteService } from '../../services/docente.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Router } from '@angular/router';

@Component({
    selector: 'app-buscador-docentes',
    templateUrl: './buscador-docentes.component.html',
    styleUrls: ['./buscador-docentes.component.scss'],
})
export class BuscadorDocentesComponent implements OnInit {
    docentes: Docente[] = [
        {
            id: 1,
            estado: 'Activo',
            persona: {
                id: 101,
                identificacion: 123456789,
                nombre: 'Juan',
                apellido: 'Pérez',
                correoElectronico: 'juan.perez@example.com',
                telefono: '123-456-7890',
                genero: 'Masculino',
                tipoIdentificacion: 'Cédula',
            },
            codigo: 'DOC001',
            facultad: 'Facultad de Ciencias',
            departamento: 'Departamento de Física',
            escalafon: 'Profesor Asociado',
            observacion: 'Docente destacado en investigación',
            lineasInvestigacion: [
                {
                    id: 201,
                    titulo: 'Física de partículas',
                    categoria: 'Investigación Básica',
                },
                {
                    id: 202,
                    titulo: 'Física cuántica',
                    categoria: 'Investigación Básica',
                },
            ],
            tipoVinculacion: 'Planta',
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
        // Otros cinco docentes con datos ficticios similares...
    ];
    docenteSeleccionado: Docente;
    loading: boolean;

    constructor(
        private docenteService: DocenteService,
        private ref: DynamicDialogRef,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.listDocentes();
    }

    listDocentes() {
        this.loading = true;
        this.docenteService
            .listDocentes()
            .subscribe({
                next: (response) =>
                    (this.docentes = this.getDocentesActivos(response)),
            })
            .add(() => (this.loading = false));
    }

    filterDocentes(filter: string) {
        if (filter?.trim()) {
            this.loading = true;
            this.docenteService
                .filterDocentes(filter)
                .subscribe({
                    next: (response) =>
                        (this.docentes = this.getDocentesActivos(response)),
                })
                .add(() => (this.loading = false));
        } else {
            this.listDocentes();
        }
        this.docenteSeleccionado = null;
    }

    getDocentesActivos(docentes: Docente[]) {
        return docentes.filter((d) => d.estado === 'ACTIVO');
    }

    onCancel() {
        this.ref.close();
    }

    onSeleccionar() {
        if (this.docenteSeleccionado) {
            this.ref.close(this.docenteSeleccionado);
        }
    }

    onRegistrar() {
        this.ref.close();
        this.router.navigate(['docentes/registrar']);
    }
}
