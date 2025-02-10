import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatriculaEvaluacionService } from '../../services/matricula-evaluacion.service';
import { ConfirmationService, MessageService } from 'primeng/api';

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
        private readonly router: Router,
        private readonly matriculaEvaluacionService: MatriculaEvaluacionService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) { }

    ngOnInit() {
        this.loadEvaluations({ first: 0, rows: 5 });
    }

    loadEvaluations(event: any) {
        this.loading = true;

        this.matriculaEvaluacionService.listarEvaluciones().subscribe(
            (data: any[]) => {
                this.evaluaciones = data.map((evaluacion) => ({
                    id: evaluacion.id,
                    periodo: +evaluacion.periodo, // Convertir a número
                    anio: +evaluacion.anio, // Convertir a número
                    nombre: evaluacion.nombreCuestionario || '', // Asegurar string
                    asignaturasEvaluadas: +evaluacion.cantidadAsignaturas, // Convertir a número
                    estado: evaluacion.estado || '', // Asegurar string
                    fechaCreacion: evaluacion.fechaCreacion ? new Date(evaluacion.fechaCreacion) : null,
                    fechaInicio: evaluacion.fechaInicio ? this.convertirFecha(evaluacion.fechaInicio) : null,
                    fechaFin: evaluacion.fechaFin ? this.convertirFecha(evaluacion.fechaFin) : null,
                }));

                this.totalRecords = this.evaluaciones.length;
                this.hasActiveEvaluations = this.evaluaciones.some((e) => e.estado === 'ACTIVO');
                this.loading = false;
            },
            () => {
                this.loading = false;
            }
        );
    }

    convertirFecha(fechaString: string): Date {
        const partes = fechaString.split('/');
        return new Date(+partes[2], +partes[1] - 1, +partes[0]); // Formato (YYYY, MM, DD)
    }

    confirmarCambioEstado(event: Event, evaluacion: any, nuevoEstado: string) {
        const mensaje =
            nuevoEstado === 'ACTIVO'
                ? '¿Estás seguro de que deseas activar esta evaluación?'
                : '¿Estás seguro de que deseas desactivar esta evaluación?';

        this.confirmationService.confirm({
            target: event.target!,
            message: mensaje,
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí',
            rejectLabel: 'No',
            accept: () => {
                this.updateEstado(evaluacion, nuevoEstado);
            },
        });
    }

    updateEstado(evaluacion: any, estado: string) {
        this.loading = true;
        this.matriculaEvaluacionService
            .actualizarEstadoEvaluacion(evaluacion.id, estado)
            .subscribe(
                () => {
                    evaluacion.estado = estado;
                    this.hasActiveEvaluations = this.evaluaciones.some(
                        (e) => e.estado === 'ACTIVO'
                    );
                    this.loading = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: `Evaluación ${estado === 'ACTIVO' ? 'activada' : 'desactivada'} con éxito.`,
                    });
                },
                () => {
                    this.loading = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Hubo un error al actualizar el estado de la evaluación.',
                    });
                }
            );
    }

    onAddEvaluation() {
        this.router.navigate(['/gestion-matricula-evaluacion/agregar-evaluacion']);
    }
}
