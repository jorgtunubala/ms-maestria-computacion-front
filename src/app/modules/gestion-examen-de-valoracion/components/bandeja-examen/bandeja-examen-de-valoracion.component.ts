import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, catchError, firstValueFrom, of } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { BuscadorEstudiantesComponent } from 'src/app/shared/components/buscador-estudiantes/buscador-estudiantes.component';
import { LocalStorageService } from 'src/app/shared/services/localstorage.service';
import { Aviso, EstadoProceso } from 'src/app/core/enums/enums';
import { Estudiante } from 'src/app/modules/gestion-estudiantes/models/estudiante';
import { Solicitud } from '../../models/solicitud';
import { SolicitudService } from '../../services/solicitud.service';
import { EstudianteService } from 'src/app/shared/services/estudiante.service';
import { TrabajoDeGradoService } from '../../services/trabajoDeGrado.service';
import { RespuestaService } from '../../services/respuesta.service';
import { ResolucionService } from '../../services/resolucion.service';
import { SustentacionService } from '../../services/sustentacion.service';
import { AutenticacionService } from 'src/app/modules/gestion-autenticacion/services/autenticacion.service';
import { ConfirmationService, MessageService, PrimeIcons } from 'primeng/api';
import { infoMessage } from 'src/app/core/utils/message-util';

@Component({
    selector: 'app-bandeja-examen-de-valoracion',
    templateUrl: './bandeja-examen-de-valoracion.component.html',
    styleUrls: ['./bandeja-examen-de-valoracion.component.scss'],
})
export class BandejaExamenDeValoracionComponent implements OnInit {
    estudiante: Estudiante;
    estudianteSeleccionado: Estudiante;

    loading: boolean;

    estadosPermitidos: string[] = [
        EstadoProceso.EXAMEN_DE_VALORACION_CANCELADO,
        EstadoProceso.CANCELADO_TRABAJO_GRADO,
        EstadoProceso.SUSTENTACION_APROBADA,
    ];
    estados: any[] = Object.keys(EstadoProceso).map((value, index) => ({
        index,
        text: value
            .split('_')
            .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
            .join(' '),
    }));
    selectedEstados: number[] = this.estados.map((estado) => estado.index);
    solicitudesPorEstado: Solicitud[] | any[] = [];
    solicitudesPorEstudiante: Solicitud[] | any[] = [];
    role: string[];

    private estudianteSubscription: Subscription;
    private trabajoDeGradoSubscription: Subscription;
    private solicitudSubscription: Subscription;
    private respuestaSubscription: Subscription;
    private resolucionSubscription: Subscription;
    private sustentacionSubscription: Subscription;

    constructor(
        private autenticacion: AutenticacionService,
        private cdr: ChangeDetectorRef,
        private confirmationService: ConfirmationService,
        private dialogService: DialogService,
        private estudianteService: EstudianteService,
        private localStorageService: LocalStorageService,
        private messageService: MessageService,
        private resolucionService: ResolucionService,
        private respuestaService: RespuestaService,
        private router: Router,
        private solicitudService: SolicitudService,
        private sustentacionService: SustentacionService,
        private trabajoDeGradoService: TrabajoDeGradoService
    ) {}

    ngOnInit() {
        this.initializeComponent();
    }

    async initializeComponent() {
        this.role = this.autenticacion.getRole();
        const isCoordinatorOrCommittee =
            this.role.includes('ROLE_COORDINADOR') ||
            this.role.includes('ROLE_COMITE');
        const isDocenteOrEstudiante =
            this.role.includes('ROLE_DOCENTE') ||
            this.role.includes('ROLE_ESTUDIANTE');

        if (isCoordinatorOrCommittee) {
            await this.listTrabajosDeGradoPorEstados(this.selectedEstados);
            this.selectedEstados = [...this.estados];
            this.cdr.detectChanges();
        }

        if (isDocenteOrEstudiante) {
            const estudiante = this.localStorageService.getLocalStorage('est');
            if (estudiante) {
                this.trabajoDeGradoService.setEstudianteSeleccionado(
                    estudiante
                );
                this.estudianteSeleccionado = estudiante;
                await this.listTrabajosDeGradoPorEstudiante(
                    this.estudianteSeleccionado.id
                );
            }
        }
    }

    onStateChange(event: any): void {
        const selectedIndices = event.value.map((estado: any) => estado.index);
        this.listTrabajosDeGradoPorEstados(selectedIndices);
    }

    listTrabajosDeGradoPorEstudiante(estudianteId: number) {
        return new Promise<void>((resolve, reject) => {
            this.loading = true;
            this.trabajoDeGradoSubscription = this.trabajoDeGradoService
                .listTrabajosDeGradoPorEstudiante(estudianteId)
                .subscribe({
                    next: (response) => {
                        if (response) {
                            this.solicitudesPorEstudiante =
                                response.trabajoGrado;
                            resolve();
                        }
                    },
                    error: (e) => {
                        console.error(e);
                    },
                    complete: () => {
                        this.loading = false;
                    },
                });
        });
    }

    listTrabajosDeGradoPorEstados(estados: number[]) {
        return new Promise<void>((resolve, reject) => {
            this.loading = true;
            this.trabajoDeGradoSubscription = this.trabajoDeGradoService
                .listTrabajosDeGradoPorEstado(estados.length ? estados : [0])
                .subscribe({
                    next: (response) => {
                        if (response) {
                            this.solicitudesPorEstado = response;
                            resolve();
                        }
                    },
                    error: (e) => {
                        console.error(e);
                    },
                    complete: () => {
                        this.loading = false;
                    },
                });
        });
    }

    isCrearExamenDisabled(): boolean {
        if (this.solicitudesPorEstudiante.length == 0) {
            return false;
        }
        const ultimoTrabajoDeGrado =
            this.solicitudesPorEstudiante[
                this.solicitudesPorEstudiante.length - 1
            ];
        return !this.estadosPermitidos.includes(ultimoTrabajoDeGrado.estado);
    }

    onProcesoExamen() {
        this.router.navigate(['examen-de-valoracion/solicitud']);
    }

    async onEditar(id: number, estudianteId: number, titulo: string) {
        this.unsubscribePreviousSubscriptions();

        if (estudianteId) {
            try {
                const estudianteResponse = await firstValueFrom(
                    this.estudianteService
                        .getEstudiante(estudianteId)
                        .pipe(catchError(() => of(null)))
                );

                if (estudianteResponse) {
                    this.estudiante =
                        this.mapEstudianteLabel(estudianteResponse);
                    this.trabajoDeGradoService.setEstudianteSeleccionado(
                        this.estudiante
                    );
                }
            } catch (error) {
                // Manejar error si es necesario
            }
        }

        try {
            const trabajoDeGradoResponse = await firstValueFrom(
                this.trabajoDeGradoService
                    .getTrabajoDeGrado(id)
                    .pipe(catchError(() => of(null)))
            );

            if (trabajoDeGradoResponse) {
                this.trabajoDeGradoService.setTrabajoSeleccionado(
                    trabajoDeGradoResponse
                );
            }
        } catch (error) {
            // Manejar error si es necesario
        }

        try {
            const solicitudResponse = await firstValueFrom(
                this.solicitudService
                    .getSolicitudDocente(id)
                    .pipe(catchError(() => of(null)))
            );

            if (solicitudResponse) {
                this.trabajoDeGradoService.setSolicitudSeleccionada(
                    solicitudResponse
                );
            }
        } catch (error) {
            // Manejar error si es necesario
        }

        try {
            const respuestaResponse = await firstValueFrom(
                this.respuestaService
                    .getRespuestasExamen(id)
                    .pipe(catchError(() => of(null)))
            );

            if (respuestaResponse) {
                this.trabajoDeGradoService.setRespuestaSeleccionada(
                    respuestaResponse
                );
            }
        } catch (error) {
            // Manejar error si es necesario
        }

        try {
            const resolucionResponse = await firstValueFrom(
                this.resolucionService
                    .getResolucionDocente(id)
                    .pipe(catchError(() => of(null)))
            );

            if (resolucionResponse) {
                this.trabajoDeGradoService.setResolucionSeleccionada(
                    resolucionResponse
                );
            }
        } catch (error) {
            // Manejar error si es necesario
        }

        try {
            const sustentacionResponse = await firstValueFrom(
                this.sustentacionService
                    .getSustentacionDocente(id)
                    .pipe(catchError(() => of(null)))
            );

            if (sustentacionResponse) {
                this.trabajoDeGradoService.setSustentacionSeleccionada(
                    sustentacionResponse
                );
                this.trabajoDeGradoService.setTituloSeleccionadoSubject(titulo);
                if (this.role.includes('ROLE_ESTUDIANTE')) {
                    await this.router.navigate([
                        'examen-de-valoracion/sustentacion/editar',
                        id,
                    ]);
                    return;
                }
            }
        } catch (error) {
            // Manejar error si es necesario
        }

        if (!this.role.includes('ROLE_ESTUDIANTE')) {
            await this.router.navigate([
                'examen-de-valoracion/solicitud/editar',
                id,
            ]);
        }
    }

    private unsubscribePreviousSubscriptions() {
        if (this.estudianteSubscription) {
            this.estudianteSubscription.unsubscribe();
        }
        if (this.trabajoDeGradoSubscription) {
            this.trabajoDeGradoSubscription.unsubscribe();
        }
        if (this.solicitudSubscription) {
            this.solicitudSubscription.unsubscribe();
        }
        if (this.respuestaSubscription) {
            this.respuestaSubscription.unsubscribe();
        }
        if (this.resolucionSubscription) {
            this.resolucionSubscription.unsubscribe();
        }
        if (this.sustentacionSubscription) {
            this.sustentacionSubscription.unsubscribe();
        }
    }

    mapEstudianteLabel(estudiante: any) {
        return {
            id: estudiante.id,
            nombre: estudiante.nombre,
            codigo: estudiante.codigo,
            apellido: estudiante.apellido,
            identificacion: estudiante.identificacion,
            tipoIdentificacion: estudiante.tipoIdentificacion,
        };
    }

    showBuscadorEstudiantes() {
        return this.dialogService.open(BuscadorEstudiantesComponent, {
            header: 'Seleccionar estudiante',
            width: '60%',
        });
    }

    limpiarEstudiante() {
        this.estudianteSeleccionado = null;
        this.localStorageService.clearLocalStorage('est');
        this.solicitudesPorEstudiante = [];
    }

    onDelete(event: any, id: number) {
        this.confirmationService.confirm({
            target: event.target,
            message: Aviso.CONFIRMAR_ELIMINAR_REGISTRO,
            icon: PrimeIcons.EXCLAMATION_TRIANGLE,
            acceptLabel: 'Si, eliminar',
            rejectLabel: 'No',
            accept: () => this.cancelarTrabajoDeGrado(id),
        });
    }

    cancelarTrabajoDeGrado(id: number) {
        this.trabajoDeGradoService.cancelTrabajoDeGrado(id).subscribe({
            next: () => {
                this.messageService.add(
                    infoMessage(Aviso.SOLICITUD_ELIMINADA_CORRECTAMENTE)
                );
                this.listTrabajosDeGradoPorEstados([34]);
            },
        });
    }

    onSeleccionarEstudiante() {
        const ref = this.showBuscadorEstudiantes();
        ref.onClose.subscribe({
            next: (response) => {
                if (response) {
                    this.estudianteSeleccionado =
                        this.mapEstudianteLabel(response);
                    this.trabajoDeGradoService.setEstudianteSeleccionado(
                        this.estudianteSeleccionado
                    );
                    this.localStorageService.saveLocalStorage(
                        this.mapEstudianteLabel(response),
                        'est'
                    );
                    this.listTrabajosDeGradoPorEstudiante(
                        this.estudianteSeleccionado.id
                    );
                }
            },
        });
    }
}
