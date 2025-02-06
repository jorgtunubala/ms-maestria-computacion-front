import { Component, OnInit } from '@angular/core';
import { CuestionarioService } from '../../../gestion-cuestionarios/services/cuestionario.service';
import { MatriculaEvaluacionService } from '../../services/matricula-evaluacion.service';
import { Cuestionario } from '../../../gestion-cuestionarios/models/cuestionario';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-agregar-evaluacion',
    templateUrl: './agregar-evaluacion.component.html',
    styleUrls: ['./agregar-evaluacion.component.scss'],
})
export class AgregarEvaluacionComponent implements OnInit {
    evaluacion: any = {
        periodo: null,
        anio: null,
        cuestionario: null,
    };
    selectedYear: Date | null = null;
    cuestionarios: any[] = [];
    mostrarDetalles: boolean = false;
    evaluacionExistente: boolean = false;
    yearRange: string;
    areasFormacion: any[] = [];
    cantidadEstudiantesRegistrados: number = 0;

    loading: boolean = false;

    constructor(
        private readonly cuestionarioService: CuestionarioService,
        private readonly matriculaEvaluacionService: MatriculaEvaluacionService,
        private readonly messageService: MessageService
    ) {
        const currentYear = new Date().getFullYear();
        this.yearRange = `${currentYear - 100}:${currentYear}`;
    }

    ngOnInit(): void {
        this.cuestionarios = [
            { label: 'Seleccionar cuestionario', value: null },
        ];
        this.loadCuestionarios();
    }

    loadCuestionarios(): void {
        this.cuestionarioService.listCuestionarios().subscribe(
            (data: Cuestionario[]) => {
                this.cuestionarios = data.map((c) => ({
                    label: c.nombre,
                    value: c.id,
                }));
                this.cuestionarios.unshift({
                    label: 'Seleccionar cuestionario',
                    value: null,
                });
            },
            (error) => {
                console.error('Error al cargar los cuestionarios', error);
            }
        );
    }

    onYearSelect(event: Date) {
        this.evaluacion.anio = event.getFullYear();
        console.log('Año seleccionado:', this.evaluacion.anio);
    }

    verDetalles() {
        const { anio, periodo } = this.evaluacion;

        if (!anio || !periodo) {
            console.error('Debe seleccionar año y periodo');
            return;
        }

        this.matriculaEvaluacionService
            .obtenerEvaluacionMetadata(anio, periodo)
            .subscribe(
                (data) => {
                    this.mostrarDetalles = true;
                    this.evaluacionExistente = data.evaluacionActiva || false;

                    this.areasFormacion = data.areasFormacion;
                    this.cantidadEstudiantesRegistrados =
                        data.cantidadEstudiantesResgistrados;
                },
                (error) => {
                    console.error(
                        'Error al obtener los detalles de la evaluación:',
                        error
                    );
                }
            );
    }

    registrarEvaluacion() {
        const { anio, periodo, cuestionario } = this.evaluacion;

        if (!anio || !periodo || !cuestionario) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Campos incompletos',
                detail: 'Debe completar todos los campos para registrar la evaluación.',
            });
            return;
        }

        const body = {
            anio,
            periodo,
            id_cuestionario: cuestionario,
        };

        this.loading = true;
        this.matriculaEvaluacionService.registrarEvaluacion(body).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'La evaluación se registró correctamente.',
                });
            },
            error: (error) => {
                console.error('Error al registrar la evaluación:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Hubo un problema al registrar la evaluación.',
                });
            },
            complete: () => {
                this.loading = false;
            },
        });
    }
}
