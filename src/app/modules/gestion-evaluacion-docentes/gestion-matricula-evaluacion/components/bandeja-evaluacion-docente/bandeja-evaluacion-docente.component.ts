import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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

    constructor(private router: Router) {}

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

        // Simulación de carga de datos
        setTimeout(() => {
            const datosSimulados = [
                {
                    periodo: '2',
                    anio: 2020,
                    nombre: 'Cuestionario de evaluación docente',
                    asignaturasEvaluadas: 10,
                    estado: 'Cerrada',
                },
                {
                    periodo: '1',
                    anio: 2020,
                    nombre: 'Cuestionario de evaluación docente',
                    asignaturasEvaluadas: 10,
                    estado: 'Cerrada',
                },
                {
                    periodo: '2',
                    anio: 2019,
                    nombre: 'Cuestionario de evaluación docente',
                    asignaturasEvaluadas: 9,
                    estado: 'Cerrada',
                },
                {
                    periodo: '1',
                    anio: 2019,
                    nombre: 'Cuestionario de evaluación docente',
                    asignaturasEvaluadas: 8,
                    estado: 'Cerrada',
                },

                {
                    periodo: '1',
                    anio: 2023,
                    nombre: 'Cuestionario de evaluación docente',
                    asignaturasEvaluadas: 12,
                    estado: 'Cerrada',
                }, // Evaluación activa
            ];

            // Ordenar datos por el campo especificado
            this.evaluaciones = datosSimulados.sort((a, b) => {
                const fieldA = a[event.sortField];
                const fieldB = b[event.sortField];
                return (fieldA < fieldB ? -1 : 1) * event.sortOrder;
            });

            this.totalRecords = this.evaluaciones.length;
            this.loading = false;

            // Verificar si hay evaluaciones activas
            this.hasActiveEvaluations = this.evaluaciones.some(
                (e) => e.estado === 'Activa'
            );
        }, 1000);
    }

    viewStatistics(evaluacion: any) {
        // Lógica para ver estadísticas de la evaluación
        console.log('Ver estadísticas de', evaluacion);
    }
}
