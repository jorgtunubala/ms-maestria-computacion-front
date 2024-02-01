import { Component, OnInit } from '@angular/core';
import { Estudiante } from '../../models/estudiante';
import { EstudianteService } from '../../services/estudiante.service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-buscador-estudiantes',
    templateUrl: './buscador-estudiantes.component.html',
    styleUrls: ['./buscador-estudiantes.component.scss'],
})
export class BuscadorEstudiantesComponent implements OnInit {
    docenteId: number = 1; // Id del docente logeado (simulado)
    estudiantes: Estudiante[] = [];
    estudianteSeleccionado: Estudiante;
    loading: boolean;

    constructor(
        private estudianteService: EstudianteService,
        private ref: DynamicDialogRef
    ) {}

    ngOnInit(): void {
        this.listEstudiantesBajoDireccion();
    }

    listEstudiantesBajoDireccion() {
        this.loading = true;
        // Simulación de datos de estudiantes
        const estudiantesEjemplo: Estudiante[] = [
            {
                id: 1,
                codigo: 'EST001',
                persona: {
                    id: 101,
                    identificacion: 987654321,
                    nombre: 'Maria',
                    apellido: 'Gomez',
                    correoElectronico: 'maria.gomez@example.com',
                    telefono: '987-654-3210',
                    genero: 'Femenino',
                    tipoIdentificacion: 'Cédula',
                },
                idDirector: this.docenteId,
            },
            {
                id: 2,
                codigo: 'EST002',
                persona: {
                    id: 102,
                    identificacion: 123456789,
                    nombre: 'Carlos',
                    apellido: 'Perez',
                    correoElectronico: 'carlos.perez@example.com',
                    telefono: '123-456-7890',
                    genero: 'Masculino',
                    tipoIdentificacion: 'Cédula',
                },
                idDirector: this.docenteId,
            },
            // Otros estudiantes de ejemplo...
        ];

        // Filtra los estudiantes bajo la dirección del docente
        this.estudiantes = estudiantesEjemplo.filter(
            (e) => e.idDirector == this.docenteId
        );

        setTimeout(() => {
            this.loading = false;
        }, 1000);
    }

    filterEstudiantes(filter: string) {
        if (filter?.trim()) {
            this.loading = true;
            this.estudianteService
                .filterEstudiantes(filter)
                .subscribe({
                    next: (response) =>
                        (this.estudiantes =
                            this.getEstudiantesBajoDireccion(response)),
                })
                .add(() => (this.loading = false));
        } else {
            this.listEstudiantesBajoDireccion();
        }
        this.estudianteSeleccionado = null;
    }

    getEstudiantesBajoDireccion(estudiantes: Estudiante[]) {
        return estudiantes.filter((e) => e.idDirector == this.docenteId);
    }

    onCancel() {
        this.ref.close();
    }

    onSeleccionar() {
        if (this.estudianteSeleccionado) {
            this.ref.close(this.estudianteSeleccionado);
        }
    }
}
