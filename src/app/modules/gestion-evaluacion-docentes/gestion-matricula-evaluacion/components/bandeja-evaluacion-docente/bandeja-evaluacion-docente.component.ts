import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatriculaEvaluacionService } from '../../services/matricula-evaluacion.service';

@Component({
    selector: 'app-bandeja-evaluacion-docente',
    templateUrl: './bandeja-evaluacion-docente.component.html',
    styleUrls: ['./bandeja-evaluacion-docente.component.scss'],
})
export class BandejaEvaluacionDocenteComponent implements OnInit {
    evaluaciones: any[] = [];
    totalRecords: number = 0;
    hasActiveEvaluations: boolean = false;
    loading: boolean = true;

    constructor(
        private router: Router,
        private matriculaEvaluacionService: MatriculaEvaluacionService
    ) {}

    ngOnInit() {
        this.loadEvaluations({ first: 0, rows: 5 });
    }

    loadEvaluations(event: any) {
        this.loading = true;

        this.matriculaEvaluacionService.listarEvaluciones().subscribe(
            (data: any[]) => {
                this.evaluaciones = data.map((evaluacion) => ({
                    id: evaluacion.id,
                    periodo: evaluacion.periodo,
                    anio: evaluacion.anio,
                    nombre: evaluacion.nombreCuestionario,
                    asignaturasEvaluadas: evaluacion.cantidadAsignaturas,
                    estado: evaluacion.estado,
                }));

                this.totalRecords = this.evaluaciones.length;
                this.loading = false;

                this.hasActiveEvaluations = this.evaluaciones.some(
                    (e) => e.estado === 'ACTIVO'
                );
            },
            (error) => {
                console.error('Error al cargar las evaluaciones', error);
                this.loading = false;
            }
        );
    }

    // Método para navegar a la página de agregar evaluación
    onAddEvaluation() {
        console.log('Navegando a la página de agregar evaluación');
        this.router.navigate([
            '/gestion-matricula-evaluacion/agregar-evaluacion',
        ]);
    }
}
