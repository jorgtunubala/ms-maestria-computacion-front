import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatriculaEvaluacionService } from '../../services/matricula-evaluacion.service'; // Asegúrate de importar correctamente el servicio

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
        private matriculaEvaluacionService: MatriculaEvaluacionService // Inyectar el servicio
    ) {}

    ngOnInit() {
        // Inicialización de datos
        this.loadEvaluations({ first: 0, rows: 5 });
    }

    onAddEvaluation() {
        this.router.navigate(['gestion-matricula-evaluacion/agregar-evaluacion']);
        //imprimir la ruta 
        console.log('Ruta:', this.router.url);
    }

    loadEvaluations(event: any) {
        this.loading = true;

        this.matriculaEvaluacionService.listarEvaluciones().subscribe(
            (data: any[]) => {
                // Mapear los datos para que coincidan con la estructura esperada en la tabla
                this.evaluaciones = data.map((evaluacion) => ({
                    periodo: evaluacion.periodo,
                    anio: evaluacion.anio,
                    nombre: evaluacion.nombreCuestionario,
                    asignaturasEvaluadas: evaluacion.cantidadAsignaturas,
                    estado: evaluacion.estado
                }));

                // Ordenar datos por el campo especificado
                this.evaluaciones.sort((a, b) => {
                    const fieldA = a[event.sortField];
                    const fieldB = b[event.sortField];
                    return (fieldA < fieldB ? -1 : 1) * event.sortOrder;
                });

                this.totalRecords = this.evaluaciones.length;
                this.loading = false;

                // Verificar si hay evaluaciones activas
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

    viewStatistics(evaluacion: any) {
        // Lógica para ver estadísticas de la evaluación
        console.log('Ver estadísticas de', evaluacion);
    }
}
