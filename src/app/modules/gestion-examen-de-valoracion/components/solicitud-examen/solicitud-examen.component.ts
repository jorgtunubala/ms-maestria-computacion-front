import {
    Component,
    EventEmitter,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
    Subscription,
    catchError,
    forkJoin,
    lastValueFrom,
    of,
    timer,
} from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { FileUpload } from 'primeng/fileupload';
import { Aviso, EstadoProceso, Mensaje } from 'src/app/core/enums/enums';
import { mapResponseException } from 'src/app/core/utils/exception-util';
import {
    errorMessage,
    infoMessage,
    warnMessage,
} from 'src/app/core/utils/message-util';
import { Docente } from 'src/app/modules/gestion-docentes/models/docente';
import { Estudiante } from 'src/app/modules/gestion-estudiantes/models/estudiante';
import { BuscadorDocentesComponent } from 'src/app/shared/components/buscador-docentes/buscador-docentes.component';
import { BuscadorExpertosComponent } from 'src/app/shared/components/buscador-expertos/buscador-expertos.component';
import { DocenteService } from 'src/app/shared/services/docente.service';
import { ExpertoService } from 'src/app/shared/services/experto.service';
import { Experto } from '../../models/experto';
import { Solicitud } from '../../models/solicitud';
import { RespuestaService } from '../../services/respuesta.service';
import { ResolucionService } from '../../services/resolucion.service';
import { SolicitudService } from '../../services/solicitud.service';
import { TrabajoDeGradoService } from '../../services/trabajoDeGrado.service';
import { AutenticacionService } from 'src/app/modules/gestion-autenticacion/services/autenticacion.service';

@Component({
    selector: 'app-solicitud-examen',
    templateUrl: 'solicitud-examen.component.html',
    styleUrls: ['solicitud-examen.component.scss'],
})
export class SolicitudExamenComponent implements OnInit {
    @Output() formReady = new EventEmitter<FormGroup>();
    solicitudForm: FormGroup;

    @ViewChild('FormatoA') FormatoA!: FileUpload;
    @ViewChild('FormatoD') FormatoD!: FileUpload;
    @ViewChild('FormatoE') FormatoE!: FileUpload;
    @ViewChild('OficioDirigidoEvaluadores')
    OficioDirigidoEvaluadores!: FileUpload;

    private estudianteSubscription: Subscription;
    private trabajoSeleccionadoSubscription: Subscription;
    private resolucionSubscription: Subscription;
    private respuestaSubscription: Subscription;
    private sustentacionSubscription: Subscription;
    private solicitudSubscription: Subscription;
    private solicitudValidSubscription: Subscription;
    private respuestaValidSubscription: Subscription;
    private resolucionValidSubscription: Subscription;

    trabajoDeGradoId: number;
    solicitudId: number;
    respuestaId: number;
    resolucionId: number;
    sustentacionId: number;
    currentPdfIndex: number = 0;

    displayFormatos: boolean = false;
    displayFormatoA: boolean = false;
    displayFormatoOficioDirigidoEvaluadores: boolean = false;
    displayModal: boolean = false;
    errorMessageShown: boolean = false;
    editMode: boolean = false;
    isLoading: boolean;
    isChanged: boolean = false;
    isDocente: boolean = false;
    isCoordinadorFase1: boolean = false;
    isCoordinadorFase2: boolean = false;
    isDocenteCreated: boolean = false;
    isCoordinadorFase1Created: boolean = false;
    isCoordinadorFase2Created: boolean = false;
    isPdfLoaded: boolean = false;
    isSolicitudValid: boolean = false;
    isRespuestaValid: boolean = false;
    isResolucionValid: boolean = false;
    isSustentacionValid: boolean = false;
    isReviewed: boolean = false;

    estudianteSeleccionado: Estudiante;
    evaluadorInternoSeleccionado: Docente;
    evaluadorExternoSeleccionado: Experto;

    formatoA: File | null;
    formatoBEv1: File | null;
    formatoCEv1: File | null;
    formatoBEv2: File | null;
    formatoCEv2: File | null;
    FileFormatoA: File | null;
    FileFormatoD: File | null;
    FileFormatoE: File | null;
    FileOficioDirigidoEvaluadores: File | null;

    role: string[];
    anexosFiles: File[] = [];
    anexosBase64: { linkAnexo: string }[] = [];
    pdfUrls: { name: string; url: string }[] = [];
    estadosRespuesta: string[] = ['Avalado', 'No Avalado'];
    estadosVerificacion: string[] = ['Aceptado', 'Rechazado'];

    estado: string;
    currentFormat: string = 'formatoBEv1';

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private messageService: MessageService,
        private dialogService: DialogService,
        private trabajoDeGradoService: TrabajoDeGradoService,
        private solicitudService: SolicitudService,
        private respuestaService: RespuestaService,
        private resolucionService: ResolucionService,
        private autenticacion: AutenticacionService,
        private docenteService: DocenteService,
        private expertoService: ExpertoService
    ) {}

    get evaluadorExterno(): FormControl {
        return this.solicitudForm.get('idEvaluadorExterno') as FormControl;
    }

    get evaluadorInterno(): FormControl {
        return this.solicitudForm.get('idEvaluadorInterno') as FormControl;
    }

    ngOnInit() {
        this.initializeComponent();
    }

    async initializeComponent() {
        this.role = this.autenticacion.getRole();
        this.subscribeToEstudiante();
        this.initForm();
        if (this.router.url.includes('editar')) {
            await this.subscribeToObservers();
            this.loadEditMode();
        }
        this.checkEstados();
    }

    async loadEditMode() {
        this.editMode = true;
        await this.loadSolicitud();
    }

    initForm(): void {
        this.solicitudForm = this.fb.group({
            titulo: [null, Validators.required],
            linkFormatoA: [null, Validators.required],
            linkFormatoD: [null, Validators.required],
            linkFormatoE: [null, Validators.required],
            anexos: [[], Validators.required],
            idEvaluadorExterno: [null, Validators.required],
            idEvaluadorInterno: [null, Validators.required],
            asuntoCoordinador: [null],
            mensajeCoordinador: [null],
            asuntoComite: [null],
            mensajeComite: [null],
            conceptoCoordinadorDocumentos: [null, Validators.required],
            conceptoComite: [null, Validators.required],
            numeroActa: [null, Validators.required],
            fechaActa: [null, Validators.required],
            linkOficioDirigidoEvaluadores: [null, Validators.required],
            fechaMaximaEvaluacion: [null, Validators.required],
        });

        this.formReady.emit(this.solicitudForm);

        this.solicitudForm
            .get('conceptoCoordinadorDocumentos')
            .valueChanges.subscribe((value) => {
                if (value == 'Aceptado') {
                    this.solicitudForm
                        .get('asuntoCoordinador')
                        .setValue('Solicitud de revision examen de valoracion');

                    this.solicitudForm
                        .get('mensajeCoordinador')
                        .setValue(
                            'Solicito comedidamente revisar el examen de valoracion del estudiante Julio Mellizo para aprobacion.'
                        );
                }
                if (value == 'Rechazado') {
                    this.solicitudForm
                        .get('asuntoCoordinador')
                        .setValue('Correcion solicitud examen de valoracion');
                    this.solicitudForm
                        .get('mensajeCoordinador')
                        .setValue(
                            'Solicito comedidamente revisar el anteproyecto en el apartado de Introduccion.'
                        );
                }
            });

        this.solicitudForm
            .get('conceptoComite')
            .valueChanges.subscribe((value) => {
                if (value == 'Avalado') {
                    this.solicitudForm
                        .get('asuntoComite')
                        .setValue('Envio evaluadores');
                    this.solicitudForm
                        .get('mensajeComite')
                        .setValue(
                            'Envio documentos para que por favor los revisen y den respuesta oportuna.'
                        );
                }
                if (value == 'No Avalado') {
                    this.solicitudForm
                        .get('asuntoComite')
                        .setValue('Envio correcion por parte del comite');
                    this.solicitudForm
                        .get('mensajeComite')
                        .setValue(
                            'Por favor corregir el apartado de metolodogia y dar respuesta oportuna a las correciones.'
                        );
                }
            });

        if (!this.router.url.includes('editar')) {
            this.solicitudForm.valueChanges.subscribe((value) => {
                localStorage.setItem(
                    'solicitudFormState',
                    JSON.stringify(value)
                );
                this.trabajoDeGradoService.setTituloSeleccionadoSubject(
                    value.titulo
                );
            });

            const savedState = localStorage.getItem('solicitudFormState');
            if (savedState) {
                const data = JSON.parse(savedState);
                this.solicitudForm.get('titulo').setValue(data.titulo);
                this.trabajoDeGradoService.setTituloSeleccionadoSubject(
                    data.titulo
                );
                if (data?.idEvaluadorExterno) {
                    this.expertoService
                        .obtenerExperto(data?.idEvaluadorExterno)
                        .subscribe({
                            next: (response) => {
                                this.evaluadorExternoSeleccionado =
                                    this.mapEvaluadorExternoLabel(response);
                                this.trabajoDeGradoService.setEvaluadorExternoSeleccionadoSubject(
                                    this.evaluadorExternoSeleccionado
                                );
                                this.evaluadorExterno.setValue(response.id);
                            },
                        });
                }
                if (data?.idEvaluadorInterno) {
                    this.docenteService
                        .obtenerDocente(data?.idEvaluadorInterno)
                        .subscribe({
                            next: (response) => {
                                this.evaluadorInternoSeleccionado =
                                    this.mapEvaluadorInternoLabel(response);
                                this.trabajoDeGradoService.setEvaluadorInternoSeleccionadoSubject(
                                    this.evaluadorInternoSeleccionado
                                );
                                this.evaluadorInterno.setValue(response.id);
                            },
                        });
                }
            }
        }
    }

    subscribeToEstudiante() {
        this.estudianteSubscription =
            this.trabajoDeGradoService.estudianteSeleccionado$.subscribe({
                next: (response) => {
                    if (response) {
                        this.estudianteSeleccionado = response;
                    } else {
                        const isDocenteOrEstudiante =
                            this.role.includes('ROLE_DOCENTE') ||
                            this.role.includes('ROLE_ESTUDIANTE');
                        if (isDocenteOrEstudiante) {
                            this.router.navigate(['examen-de-valoracion']);
                        }
                    }
                },
                error: (e) => {
                    this.handlerResponseException(e);
                },
            });
    }

    subscribeToObservers(): Promise<void> {
        return new Promise<void>((resolve) => {
            let pendingObservables = 5;

            const checkCompletion = () => {
                pendingObservables--;
                if (pendingObservables === 0) {
                    resolve();
                }
            };

            this.trabajoSeleccionadoSubscription =
                this.trabajoDeGradoService.trabajoSeleccionadoSubject$.subscribe(
                    {
                        next: (response) => {
                            if (response) {
                                this.trabajoDeGradoId = response.id;
                                this.estado = response.estado;

                                this.solicitudValidSubscription =
                                    this.solicitudService
                                        .getSolicitudCoordinadorFase2(
                                            this.trabajoDeGradoId
                                        )
                                        .pipe(
                                            catchError(() => {
                                                return of(null);
                                            })
                                        )
                                        .subscribe({
                                            next: (response) => {
                                                if (
                                                    response?.actaFechaRespuestaComite
                                                ) {
                                                    const respuestaComite =
                                                        response.actaFechaRespuestaComite.find(
                                                            (respuesta: any) =>
                                                                respuesta.conceptoComite ===
                                                                'APROBADO'
                                                        );

                                                    if (respuestaComite) {
                                                        this.isSolicitudValid =
                                                            true;
                                                    }
                                                }
                                            },
                                        });

                                this.respuestaValidSubscription =
                                    this.respuestaService
                                        .getRespuestasExamen(
                                            this.trabajoDeGradoId
                                        )
                                        .pipe(
                                            catchError(() => {
                                                return of(null);
                                            })
                                        )
                                        .subscribe({
                                            next: (response) => {                                                
                                                if (
                                                    response?.evaluador_externo &&
                                                    response?.evaluador_interno
                                                ) {
                                                    const evaluadorExternoAprobado =
                                                        response.evaluador_externo.find(
                                                            (evaluador: any) =>
                                                                evaluador.respuestaExamenValoracion ===
                                                                'APROBADO'
                                                        );

                                                    const evaluadorInternoAprobado =
                                                        response.evaluador_interno.find(
                                                            (evaluador: any) =>
                                                                evaluador.respuestaExamenValoracion ===
                                                                'APROBADO'
                                                        );

                                                    if (
                                                        evaluadorExternoAprobado &&
                                                        evaluadorInternoAprobado
                                                    ) {
                                                        this.isRespuestaValid =
                                                            true;
                                                    }
                                                }
                                            },
                                        });

                                this.resolucionValidSubscription =
                                    this.resolucionService
                                        .getResolucionCoordinadorFase3(
                                            this.trabajoDeGradoId
                                        )
                                        .pipe(
                                            catchError(() => {
                                                return of(null);
                                            })
                                        )
                                        .subscribe({
                                            next: (response) => {
                                                if (
                                                    response?.numeroActaConsejoFacultad &&
                                                    response?.fechaActaConsejoFacultad
                                                ) {
                                                    this.isResolucionValid =
                                                        true;
                                                }
                                            },
                                        });

                                checkCompletion();
                            } else {
                                this.router.navigate(['examen-de-valoracion']);
                            }
                        },
                        error: (e) => {
                            this.handlerResponseException(e);
                            checkCompletion();
                        },
                    }
                );

            this.solicitudSubscription =
                this.trabajoDeGradoService.solicitudSeleccionadaSubject$.subscribe(
                    {
                        next: (response) => {
                            if (response) {
                                this.solicitudId = response.id;
                                checkCompletion();
                            }
                        },
                        error: (e) => {
                            this.handlerResponseException(e);
                            checkCompletion();
                        },
                    }
                );

            this.respuestaSubscription =
                this.trabajoDeGradoService.respuestaSeleccionadaSubject$.subscribe(
                    {
                        next: (response) => {
                            if (response) {
                                this.respuestaId = response.id;
                            }
                            checkCompletion();
                        },
                        error: (e) => {
                            this.handlerResponseException(e);
                            checkCompletion();
                        },
                    }
                );

            this.resolucionSubscription =
                this.trabajoDeGradoService.resolucionSeleccionadaSubject$.subscribe(
                    {
                        next: (response) => {
                            if (response) {
                                this.resolucionId = response.id;
                            }
                            checkCompletion();
                        },
                        error: (e) => {
                            this.handlerResponseException(e);
                            checkCompletion();
                        },
                    }
                );

            this.sustentacionSubscription =
                this.trabajoDeGradoService.sustentacionSeleccionadaSubject$.subscribe(
                    {
                        next: (response) => {
                            if (response) {
                                this.sustentacionId = response.id;
                            }
                            checkCompletion();
                        },
                        error: (e) => {
                            this.handlerResponseException(e);
                            checkCompletion();
                        },
                    }
                );
        });
    }

    updateFormFields(role: string[]): void {
        const formControls = this.solicitudForm.controls;

        for (const control in formControls) {
            formControls[control].disable();
        }

        if (role.includes('ROLE_DOCENTE')) {
            this.solicitudForm.get('titulo').enable();
            this.solicitudForm.get('linkFormatoA').enable();
            this.solicitudForm.get('linkFormatoD').enable();
            this.solicitudForm.get('linkFormatoE').enable();
            this.solicitudForm.get('anexos').enable();
            this.solicitudForm.get('idEvaluadorExterno').enable();
            this.solicitudForm.get('idEvaluadorInterno').enable();
        }

        if (role.includes('ROLE_COORDINADOR')) {
            if (this.isDocente && !this.isCoordinadorFase1) {
                this.solicitudForm
                    .get('conceptoCoordinadorDocumentos')
                    .enable();
                this.solicitudForm.get('asuntoCoordinador').enable();
                this.solicitudForm.get('mensajeCoordinador').enable();
            }
            if (this.isCoordinadorFase1) {
                this.solicitudForm
                    .get('conceptoComite')
                    .valueChanges.subscribe((value) => {
                        if (value == 'Avalado') {
                            this.solicitudForm
                                .get('linkOficioDirigidoEvaluadores')
                                .enable();
                            this.solicitudForm
                                .get('fechaMaximaEvaluacion')
                                .enable();
                        } else if (value == 'No Avalado') {
                            this.solicitudForm
                                .get('linkOficioDirigidoEvaluadores')
                                .disable();
                            this.solicitudForm
                                .get('fechaMaximaEvaluacion')
                                .disable();
                        }
                    });
                this.solicitudForm.get('conceptoComite').enable();
                this.solicitudForm.get('asuntoComite').enable();
                this.solicitudForm.get('mensajeComite').enable();
                this.solicitudForm.get('numeroActa').enable();
                this.solicitudForm.get('fechaActa').enable();
            }
        }
    }

    ngOnDestroy() {
        if (this.estudianteSubscription) {
            this.estudianteSubscription.unsubscribe();
        }
        if (this.trabajoSeleccionadoSubscription) {
            this.trabajoSeleccionadoSubscription.unsubscribe();
        }
        if (this.solicitudSubscription) {
            this.solicitudSubscription.unsubscribe();
        }
        if (this.solicitudValidSubscription) {
            this.solicitudValidSubscription.unsubscribe();
        }
        if (this.respuestaSubscription) {
            this.respuestaSubscription.unsubscribe();
        }
        if (this.respuestaValidSubscription) {
            this.respuestaValidSubscription.unsubscribe();
        }
        if (this.resolucionSubscription) {
            this.resolucionSubscription.unsubscribe();
        }
        if (this.resolucionValidSubscription) {
            this.resolucionValidSubscription.unsubscribe();
        }
        if (this.sustentacionSubscription) {
            this.sustentacionSubscription.unsubscribe();
        }
    }

    checkEstados() {
        switch (this.estado) {
            case EstadoProceso.SIN_REGISTRAR_SOLICITUD_EXAMEN_DE_VALORACION:
                this.isDocente = false;
                this.isCoordinadorFase1 = false;
                this.isCoordinadorFase2 = false;
                break;
            case EstadoProceso.PENDIENTE_REVISION_COORDINADOR:
                this.isDocente = true;
                this.isCoordinadorFase1 = false;
                this.isCoordinadorFase2 = false;
                break;
            case EstadoProceso.DEVUELTO_EXAMEN_DE_VALORACION_POR_COORDINADOR:
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: EstadoProceso.DEVUELTO_EXAMEN_DE_VALORACION_POR_COORDINADOR,
                    life: 2000,
                });
                this.isDocente = true;
                this.isCoordinadorFase1 = false;
                this.isCoordinadorFase2 = false;
                break;
            case EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR:
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isCoordinadorFase2 = false;
                break;
            case EstadoProceso.DEVUELTO_EXAMEN_DE_VALORACION_POR_COMITE:
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: EstadoProceso.DEVUELTO_EXAMEN_DE_VALORACION_POR_COMITE,
                    life: 2000,
                });
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isCoordinadorFase2 = false;
                break;
            case EstadoProceso.PENDIENTE_RESULTADO_EXAMEN_DE_VALORACION:
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isCoordinadorFase2 = true;
                break;
            default:
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isCoordinadorFase2 = true;
                break;
        }

        this.updateFormFields(this.role);
    }

    //#region PDF VIEWER
    async loadPdfFiles() {
        const filesToConvert = [
            {
                file: this.FileFormatoA,
                fieldName: 'Solicitud Examen de Valoración',
            },
            {
                file: this.FileFormatoD,
                fieldName: 'Anteproyecto presentado a Examen',
            },
            { file: this.FileFormatoE, fieldName: 'Examen de valoración' },
            {
                file: this.FileOficioDirigidoEvaluadores,
                fieldName: 'Oficio Dirigido a Evaluadores',
            },
            {
                file: this.formatoBEv1,
                fieldName: 'Formato B Evaluador Interno',
            },
            {
                file: this.formatoBEv2,
                fieldName: 'Formato B Evaluador Externo',
            },
            {
                file: this.formatoCEv1,
                fieldName: 'Formato C Evaluador Interno',
            },
            {
                file: this.formatoCEv2,
                fieldName: 'Formato C Evaluador Externo',
            },
            ...this.anexosFiles.map((file) => ({ file, fieldName: 'Anexo' })),
        ];

        const errorFiles = new Set<File>();

        try {
            for (const { file, fieldName } of filesToConvert) {
                if (file) {
                    try {
                        const url = URL.createObjectURL(file);
                        this.pdfUrls.push({
                            name: `${fieldName}`,
                            url,
                        });
                    } catch (error) {
                        errorFiles.add(file);
                    }
                }
            }

            if (errorFiles.size > 0) {
                this.messageService.add(
                    errorMessage('Error al convertir uno o más archivos PDF.')
                );
                this.closeModal();
            }
        } catch (generalError) {
            this.messageService.add(
                errorMessage(
                    'Se produjo un error general al cargar los archivos PDF.'
                )
            );
            this.closeModal();
        }
    }

    onPdfLoad(pdf: any) {
        if (pdf.numPages) {
            this.isPdfLoaded = true;
            console.log(`PDF loaded with ${pdf.numPages} pages.`);
        } else {
            this.isPdfLoaded = false;
            console.error('Failed to load PDF.');
        }
    }

    nextPdf() {
        if (this.currentPdfIndex < this.pdfUrls.length - 1) {
            this.isPdfLoaded = false;
            this.currentPdfIndex++;
        }
    }

    previousPdf() {
        if (this.currentPdfIndex > 0) {
            this.isPdfLoaded = false;
            this.currentPdfIndex--;
        }
    }

    openModal() {
        if (!this.isLoading) {
            this.displayModal = true;
            this.loadPdfFiles();
        }
    }

    closeModal() {
        this.displayModal = false;
        this.displayFormatos = false;
        this.pdfUrls = [];
    }
    //#endregion

    //#region Modal FormatoA, FormatoB and FormatoC
    showFormatoA() {
        this.displayFormatoA = true;
    }

    showFormatoOficioDirigidoEvaluadores() {
        this.displayFormatoOficioDirigidoEvaluadores = true;
    }

    showFormatoB() {
        this.displayFormatos = true;
        this.currentFormat = 'formatoBEv1';
    }

    previousFormat() {
        if (this.currentFormat == 'formatoCEv2') {
            this.currentFormat = 'formatoCEv1';
        } else if (this.currentFormat === 'formatoCEv1') {
            this.currentFormat = 'formatoBEv2';
        } else if (this.currentFormat === 'formatoBEv2') {
            this.currentFormat = 'formatoBEv1';
        }
    }

    nextFormat() {
        if (this.currentFormat == 'formatoBEv1') {
            this.currentFormat = 'formatoBEv2';
        } else if (this.currentFormat == 'formatoBEv2') {
            this.currentFormat = 'formatoCEv1';
        } else if (this.currentFormat == 'formatoCEv1') {
            this.currentFormat = 'formatoCEv2';
        }
    }

    getCurrentFormatName(): string {
        if (this.currentFormat === 'formatoBEv1') {
            return 'Formato B Evaluador Interno';
        } else if (this.currentFormat === 'formatoBEv2') {
            return 'Formato B Evaluador Externo';
        } else if (this.currentFormat === 'formatoCEv1') {
            return 'Formato C Evaluador Interno';
        } else if (this.currentFormat === 'formatoCEv2') {
            return 'Formato C Evaluador Externo';
        } else {
            return 'Formato Desconocido';
        }
    }

    handleFormatoAPdfGenerated(file: File) {
        const pdfFile = new File([file], 'formatoA.pdf', {
            type: 'application/pdf',
        });
        this.FileFormatoA = pdfFile;
        this.convertFileToBase64(pdfFile)
            .then((base64) => {
                this.solicitudForm
                    .get('linkFormatoA')
                    .setValue(`linkFormatoA.pdf-${base64}`);
            })
            .catch((error) => {
                console.error('Error al convertir el archivo a base64:', error);
            });
    }

    handleFormatoOficioDirigidoEvaluadoresPdfGenerated(file: File) {
        const pdfFile = new File(
            [file],
            'formatoOficioDirigidoEvaluadores.pdf',
            {
                type: 'application/pdf',
            }
        );
        this.FileOficioDirigidoEvaluadores = pdfFile;
        this.convertFileToBase64(pdfFile)
            .then((base64) => {
                this.solicitudForm
                    .get('linkOficioDirigidoEvaluadores')
                    .setValue(`linkOficioDirigidoEvaluadores.pdf-${base64}`);
            })
            .catch((error) => {
                console.error('Error al convertir el archivo a base64:', error);
            });
    }

    handleFormatoBEv1PdfGenerated(file: File) {
        const pdfFile = new File([file], 'formatoBEv1.pdf', {
            type: 'application/pdf',
        });
        this.formatoBEv1 = pdfFile;
    }

    handleFormatoBEv2PdfGenerated(file: File) {
        const pdfFile = new File([file], 'formatoBEv2.pdf', {
            type: 'application/pdf',
        });
        this.formatoBEv2 = pdfFile;
    }

    handleFormatoCEv1PdfGenerated(file: File) {
        const pdfFile = new File([file], 'formatoCEv1.pdf', {
            type: 'application/pdf',
        });
        this.formatoCEv1 = pdfFile;
    }

    handleFormatoCEv2PdfGenerated(file: File) {
        const pdfFile = new File([file], 'formatoCEv2.pdf', {
            type: 'application/pdf',
        });
        this.formatoCEv2 = pdfFile;
    }
    //#endregion

    //#region Anexos
    onUpload(event) {
        const maxFileSize = 5000000;
        for (let file of event.files) {
            let uniqueId = uuidv4().replace(/-/g, '').slice(0, 4);
            const selectedFile = file;
            if (selectedFile.size > maxFileSize) {
                this.messageService.add(
                    errorMessage(Aviso.ARCHIVO_DEMASIADO_GRANDE)
                );
                return null;
            }
            this.anexosFiles.push(file);
            const fileType = selectedFile.type.split('/')[1];
            this.convertFileToBase64(selectedFile)
                .then((base64) => {
                    this.anexosBase64.push({
                        linkAnexo: `Anexos${uniqueId}.${fileType}-${base64}`,
                    });
                    this.solicitudForm.patchValue({
                        anexos: this.anexosBase64,
                    });
                })
                .catch((error) => {
                    console.error(
                        'Error al convertir el archivo a base64:',
                        error
                    );
                });
        }
    }

    removeFile(index: number) {
        this.isChanged = true;
        this.anexosFiles.splice(index, 1);
        this.anexosBase64.splice(index, 1);
    }
    //#endregion

    async updateSolicitudExamen() {
        if (this.solicitudForm.invalid) {
            this.messageService.clear();
            this.messageService.add(
                warnMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS)
            );
            return;
        }

        this.isLoading = true;

        try {
            if (this.role.includes('ROLE_DOCENTE')) {
                if (
                    this.isDocenteCreated == true &&
                    (this.estado ==
                        EstadoProceso.DEVUELTO_EXAMEN_DE_VALORACION_POR_COORDINADOR ||
                        this.estado ==
                            EstadoProceso.DEVUELTO_EXAMEN_DE_VALORACION_POR_COMITE)
                ) {
                    const formatoA = await this.formatFileString(
                        this.FileFormatoA,
                        'linkFormatoA'
                    );

                    const formatoD = await this.formatFileString(
                        this.FileFormatoD,
                        'linkFormatoD'
                    );

                    const formatoE = await this.formatFileString(
                        this.FileFormatoE,
                        'linkFormatoE'
                    );

                    const anexos = await this.formatFileString(
                        this.anexosFiles,
                        'anexos'
                    );

                    const anexosBase64 = anexos.map(
                        (anexo: string, index: number) => ({
                            linkAnexo: `Anexos${index}.pdf-${anexo}`,
                        })
                    );

                    const solicitudData = {
                        ...this.solicitudForm.value,
                        linkFormatoA: `formatoA.pdf-${formatoA}`,
                        linkFormatoD: `formatoD.pdf-${formatoD}`,
                        linkFormatoE: `formatoE.pdf-${formatoE}`,
                        anexos: anexosBase64,
                    };

                    await lastValueFrom(
                        this.solicitudService.updateSolicitudDocente(
                            solicitudData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isDocenteCreated == true &&
                    this.isCoordinadorFase1Created == false &&
                    this.estado == EstadoProceso.PENDIENTE_REVISION_COORDINADOR
                ) {
                    const formatoA = await this.formatFileString(
                        this.FileFormatoA,
                        'linkFormatoA'
                    );

                    const formatoD = await this.formatFileString(
                        this.FileFormatoD,
                        'linkFormatoD'
                    );

                    const formatoE = await this.formatFileString(
                        this.FileFormatoE,
                        'linkFormatoE'
                    );

                    const anexos = await this.formatFileString(
                        this.anexosFiles,
                        'anexos'
                    );

                    const anexosBase64 = anexos.map(
                        (anexo: string, index: number) => ({
                            linkAnexo: `Anexos${index}.pdf-${anexo}`,
                        })
                    );

                    const solicitudData = {
                        ...this.solicitudForm.value,
                        linkFormatoA: `formatoA.pdf-${formatoA}`,
                        linkFormatoD: `formatoD.pdf-${formatoD}`,
                        linkFormatoE: `formatoE.pdf-${formatoE}`,
                        anexos: anexosBase64,
                    };

                    await lastValueFrom(
                        this.solicitudService.updateSolicitudDocente(
                            solicitudData,
                            this.trabajoDeGradoId
                        )
                    );
                } else {
                    this.isLoading = false;
                    return this.messageService.add(
                        errorMessage('No puedes modificar los datos.')
                    );
                }
            }

            if (this.role.includes('ROLE_COORDINADOR')) {
                if (
                    this.estado ==
                        EstadoProceso.DEVUELTO_EXAMEN_DE_VALORACION_POR_COORDINADOR ||
                    this.estado ==
                        EstadoProceso.DEVUELTO_EXAMEN_DE_VALORACION_POR_COMITE
                ) {
                    this.isLoading = false;
                    return this.messageService.add(
                        errorMessage('No puedes modificar los datos.')
                    );
                } else if (
                    this.isCoordinadorFase1Created == false &&
                    this.estado == EstadoProceso.PENDIENTE_REVISION_COORDINADOR
                ) {
                    const mailData =
                        this.solicitudForm.get('conceptoCoordinadorDocumentos')
                            .value == 'Aceptado'
                            ? {
                                  conceptoCoordinadorDocumentos: 'ACEPTADO',
                                  envioEmail: {
                                      asunto: this.solicitudForm.get(
                                          'asuntoCoordinador'
                                      ).value,
                                      mensaje:
                                          this.solicitudForm.get(
                                              'mensajeCoordinador'
                                          ).value,
                                  },
                              }
                            : {
                                  conceptoCoordinadorDocumentos: 'RECHAZADO',
                                  envioEmail: {
                                      asunto: this.solicitudForm.get(
                                          'asuntoCoordinador'
                                      ).value,
                                      mensaje:
                                          this.solicitudForm.get(
                                              'mensajeCoordinador'
                                          ).value,
                                  },
                              };

                    const {
                        asuntoCoordinador,
                        mensajeCoordinador,
                        ...restData
                    } = this.solicitudForm.value;

                    const solicitudData = {
                        ...restData,
                        ...mailData,
                    };

                    await lastValueFrom(
                        this.solicitudService.createSolicitudCoordinadorFase1(
                            solicitudData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isCoordinadorFase2Created == false &&
                    this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR
                ) {
                    const b64FormatoD = await this.formatFileString(
                        this.FileFormatoD,
                        'linkFormatoD'
                    );
                    const b64FormatoE = await this.formatFileString(
                        this.FileFormatoE,
                        'linkFormatoE'
                    );
                    const b64Anexos = await this.formatFileString(
                        this.anexosFiles,
                        'anexos'
                    );

                    const {
                        numeroActa,
                        fechaActa,
                        conceptoComite,
                        ...restOfFormValues
                    } = this.solicitudForm.value;

                    let b64FormatoBEv1 = '';
                    let b64FormatoCEv1 = '';
                    let b64FormatoBEv2 = '';
                    let b64FormatoCEv2 = '';
                    let b64Oficio = '';

                    if (conceptoComite == 'Avalado') {
                        if (
                            !this.formatoBEv1 ||
                            !this.formatoBEv2 ||
                            !this.formatoCEv1 ||
                            !this.formatoCEv2
                        ) {
                            this.isLoading = false;
                            return this.messageService.add(
                                warnMessage(
                                    'Error: formatos B y C son requeridos.'
                                )
                            );
                        }
                        b64FormatoBEv1 = await this.formatFileString(
                            this.formatoBEv1,
                            'formatoBEv1'
                        );
                        b64FormatoCEv1 = await this.formatFileString(
                            this.formatoCEv1,
                            'formatoCEv1'
                        );
                        b64FormatoBEv2 = await this.formatFileString(
                            this.formatoBEv2,
                            'formatoBEv2'
                        );
                        b64FormatoCEv2 = await this.formatFileString(
                            this.formatoCEv2,
                            'formatoCEv2'
                        );
                        b64Oficio = await this.formatFileString(
                            this.FileOficioDirigidoEvaluadores,
                            'linkOficioDirigidoEvaluadores'
                        );
                    }

                    const solicitudData =
                        conceptoComite == 'Avalado'
                            ? {
                                  ...restOfFormValues,
                                  actaFechaRespuestaComite: [
                                      {
                                          conceptoComite: 'APROBADO',
                                          numeroActa,
                                          fechaActa,
                                      },
                                  ],
                                  envioEmailDto: {
                                      asunto: this.solicitudForm.get(
                                          'asuntoComite'
                                      ).value,
                                      mensaje:
                                          this.solicitudForm.get(
                                              'mensajeComite'
                                          ).value,
                                  },
                                  informacionEnvioEvaluador: {
                                      b64FormatoD,
                                      b64FormatoE,
                                      b64Anexos,
                                      b64Oficio,
                                      b64FormatoBEv1,
                                      b64FormatoCEv1,
                                      b64FormatoBEv2,
                                      b64FormatoCEv2,
                                  },
                              }
                            : {
                                  actaFechaRespuestaComite: [
                                      {
                                          conceptoComite: 'NO_APROBADO',
                                          numeroActa,
                                          fechaActa,
                                      },
                                  ],
                                  envioEmailDto: {
                                      asunto: this.solicitudForm.get(
                                          'asuntoComite'
                                      ).value,
                                      mensaje:
                                          this.solicitudForm.get(
                                              'mensajeComite'
                                          ).value,
                                  },
                              };
                    await lastValueFrom(
                        this.solicitudService.createSolicitudCoordinadorFase2(
                            solicitudData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isCoordinadorFase1Created == true &&
                    this.estado == EstadoProceso.PENDIENTE_REVISION_COORDINADOR
                ) {
                    const mailData =
                        this.solicitudForm.get('conceptoCoordinadorDocumentos')
                            .value == 'Aceptado'
                            ? {
                                  conceptoCoordinadorDocumentos: 'ACEPTADO',
                                  envioEmail: {
                                      asunto: this.solicitudForm.get(
                                          'asuntoCoordinador'
                                      ).value,
                                      mensaje:
                                          this.solicitudForm.get(
                                              'mensajeCoordinador'
                                          ).value,
                                  },
                              }
                            : {
                                  conceptoCoordinadorDocumentos: 'RECHAZADO',
                                  envioEmail: {
                                      asunto: this.solicitudForm.get(
                                          'asuntoCoordinador'
                                      ).value,
                                      mensaje:
                                          this.solicitudForm.get(
                                              'mensajeCoordinador'
                                          ).value,
                                  },
                              };

                    const {
                        asuntoCoordinador,
                        mensajeCoordinador,
                        ...restData
                    } = this.solicitudForm.value;

                    const solicitudData = {
                        ...restData,
                        ...mailData,
                    };

                    await lastValueFrom(
                        this.solicitudService.updateSolicitudCoordinadorFase1(
                            solicitudData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isCoordinadorFase2Created == true &&
                    this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR
                ) {
                    const b64FormatoD = await this.formatFileString(
                        this.FileFormatoD,
                        'linkFormatoD'
                    );
                    const b64FormatoE = await this.formatFileString(
                        this.FileFormatoE,
                        'linkFormatoE'
                    );
                    const b64Anexos = await this.formatFileString(
                        this.anexosFiles,
                        'anexos'
                    );

                    const {
                        numeroActa,
                        fechaActa,
                        conceptoComite,
                        ...restOfFormValues
                    } = this.solicitudForm.value;

                    let b64FormatoBEv1 = '';
                    let b64FormatoCEv1 = '';
                    let b64FormatoBEv2 = '';
                    let b64FormatoCEv2 = '';
                    let b64Oficio = '';

                    if (conceptoComite == 'Avalado') {
                        if (
                            !this.formatoBEv1 ||
                            !this.formatoBEv2 ||
                            !this.formatoCEv1 ||
                            !this.formatoCEv2
                        ) {
                            this.isLoading = false;
                            return this.messageService.add(
                                warnMessage(
                                    'Error: formatos B y C son requeridos.'
                                )
                            );
                        }
                        b64FormatoBEv1 = await this.formatFileString(
                            this.formatoBEv1,
                            'formatoBEv1'
                        );
                        b64FormatoCEv1 = await this.formatFileString(
                            this.formatoCEv1,
                            'formatoCEv1'
                        );
                        b64FormatoBEv2 = await this.formatFileString(
                            this.formatoBEv2,
                            'formatoBEv2'
                        );
                        b64FormatoCEv2 = await this.formatFileString(
                            this.formatoCEv2,
                            'formatoCEv2'
                        );
                        b64Oficio = await this.formatFileString(
                            this.FileOficioDirigidoEvaluadores,
                            'linkOficioDirigidoEvaluadores'
                        );
                    }

                    const solicitudData =
                        conceptoComite == 'Avalado'
                            ? {
                                  ...restOfFormValues,
                                  actaFechaRespuestaComite: [
                                      {
                                          conceptoComite: 'APROBADO',
                                          numeroActa,
                                          fechaActa,
                                      },
                                  ],
                                  envioEmailDto: {
                                      asunto: this.solicitudForm.get(
                                          'asuntoComite'
                                      ).value,
                                      mensaje:
                                          this.solicitudForm.get(
                                              'mensajeComite'
                                          ).value,
                                  },
                                  informacionEnvioEvaluador: {
                                      b64FormatoD,
                                      b64FormatoE,
                                      b64Anexos,
                                      b64Oficio,
                                      b64FormatoBEv1,
                                      b64FormatoCEv1,
                                      b64FormatoBEv2,
                                      b64FormatoCEv2,
                                  },
                              }
                            : {
                                  actaFechaRespuestaComite: [
                                      {
                                          conceptoComite: 'NO_APROBADO',
                                          numeroActa,
                                          fechaActa,
                                      },
                                  ],
                                  envioEmailDto: {
                                      asunto: this.solicitudForm.get(
                                          'asuntoComite'
                                      ).value,
                                      mensaje:
                                          this.solicitudForm.get(
                                              'mensajeComite'
                                          ).value,
                                  },
                              };
                    await lastValueFrom(
                        this.solicitudService.updateSolicitudCoordinadorFase2(
                            solicitudData,
                            this.trabajoDeGradoId
                        )
                    );
                } else {
                    this.isLoading = false;
                    return this.messageService.add(
                        errorMessage('No puedes modificar los datos.')
                    );
                }
            }

            this.isLoading = false;
            this.messageService.add(infoMessage(Mensaje.ACTUALIZACION_EXITOSA));
            this.router.navigate(['examen-de-valoracion']);
        } catch (e) {
            this.isLoading = false;
            this.messageService.add(
                errorMessage('Error al actualizar los datos en el backend')
            );
        }
    }

    createSolicitudExamen(): void {
        if (this.solicitudForm.invalid) {
            this.messageService.clear();
            this.messageService.add(
                warnMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS)
            );
            return;
        }
        this.isLoading = true;
        this.trabajoDeGradoService
            .createTrabajoDeGrado(this.estudianteSeleccionado.id)
            .subscribe({
                next: (response) => {
                    if (response) {
                        this.trabajoDeGradoId = response.id;
                        this.trabajoDeGradoService.setTrabajoSeleccionado(
                            response
                        );
                    }
                },
                error: (e) => {
                    console.error(
                        'Error al guardar los datos en el backend:',
                        e
                    );
                },
                complete: () => {
                    if (this.role.includes('ROLE_DOCENTE') == true) {
                        this.solicitudService
                            .createSolicitudDocente(
                                this.solicitudForm.value,
                                this.trabajoDeGradoId
                            )
                            .subscribe({
                                next: (_) => {},
                                error: (e) => {
                                    console.error(
                                        'Error al guardar los datos en el backend:',
                                        e
                                    );
                                },
                                complete: () => {
                                    localStorage.removeItem(
                                        'solicitudFormState'
                                    );
                                    this.messageService.add(
                                        infoMessage(Mensaje.GUARDADO_EXITOSO)
                                    );
                                    timer(2000).subscribe(() => {
                                        this.isLoading = false;
                                        this.router.navigate([
                                            'examen-de-valoracion',
                                        ]);
                                    });
                                },
                            });
                    }
                },
            });
    }

    setup(fieldName: string) {
        if (fieldName == 'anexos') {
            for (let anexo of this.solicitudForm.get(fieldName).value) {
                this.trabajoDeGradoService.getFile(anexo).subscribe({
                    next: (response: any) => {
                        if (response) {
                            const byteCharacters = atob(response);
                            const byteNumbers = new Array(
                                byteCharacters.length
                            );
                            for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                            }
                            const byteArray = new Uint8Array(byteNumbers);
                            const file = new File([byteArray], fieldName, {
                                type: response.type,
                            });
                            this.anexosFiles.push(file);
                        }
                    },
                    error: (e) => {
                        if (!this.errorMessageShown) {
                            this.messageService.add(
                                warnMessage('Pendiente subir archivos.')
                            );
                            this.errorMessageShown = true;
                        }
                    },
                });
            }
            return;
        }
        this.trabajoDeGradoService
            .getFile(this.solicitudForm.get(fieldName).value)
            .subscribe({
                next: (response: any) => {
                    if (response) {
                        const byteCharacters = atob(response);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const file = new File([byteArray], fieldName, {
                            type: response.type,
                        });
                        switch (fieldName) {
                            case 'linkFormatoA':
                                this.FileFormatoA = file;
                                break;
                            case 'linkFormatoD':
                                this.FileFormatoD = file;
                                break;
                            case 'linkFormatoE':
                                this.FileFormatoE = file;
                                break;
                            case 'linkOficioDirigidoEvaluadores':
                                this.FileOficioDirigidoEvaluadores = file;
                                break;
                            default:
                                break;
                        }
                    }
                },
                error: (e) => {
                    if (!this.errorMessageShown) {
                        this.messageService.add(
                            warnMessage('Pendiente subir archivos.')
                        );
                        this.errorMessageShown = true;
                    }
                },
            });
    }

    setValuesForm(solicitud: Solicitud) {
        this.solicitudForm.patchValue({
            ...solicitud,
        });
    }

    loadSolicitud() {
        return new Promise<void>((resolve, reject) => {
            this.isLoading = true;
            const docenteObs =
                this.role.includes('ROLE_DOCENTE') ||
                this.role.includes('ROLE_COORDINADOR')
                    ? this.solicitudService
                          .getSolicitudDocente(this.trabajoDeGradoId)
                          .pipe(
                              catchError(() => {
                                  this.isDocenteCreated = false;
                                  return of(null);
                              })
                          )
                    : of(null);

            const coordinadorObsFase1 = this.role.includes('ROLE_COORDINADOR')
                ? this.solicitudService
                      .getSolicitudCoordinadorFase1(this.trabajoDeGradoId)
                      .pipe(
                          catchError(() => {
                              this.isCoordinadorFase1Created = false;
                              return of(null);
                          })
                      )
                : of(null);

            const coordinadorObsFase2 = this.role.includes('ROLE_COORDINADOR')
                ? this.solicitudService
                      .getSolicitudCoordinadorFase2(this.trabajoDeGradoId)
                      .pipe(
                          catchError(() => {
                              this.isCoordinadorFase2Created = false;
                              return of(null);
                          })
                      )
                : of(null);

            forkJoin({
                docente: docenteObs,
                coordinadorFase1: coordinadorObsFase1,
                coordinadorFase2: coordinadorObsFase2,
            }).subscribe({
                next: (responses) => {
                    if (responses.docente) {
                        this.isDocenteCreated = true;
                        const data = responses.docente;
                        this.trabajoDeGradoService.setTituloSeleccionadoSubject(
                            data.titulo
                        );
                        this.setValuesForm(data);

                        this.evaluadorInternoSeleccionado =
                            this.mapEvaluadorInternoLabel(
                                data.evaluadorInterno
                            );
                        this.trabajoDeGradoService.setEvaluadorInternoSeleccionadoSubject(
                            this.evaluadorInternoSeleccionado
                        );
                        this.evaluadorInterno.setValue(
                            data.evaluadorInterno.id
                        );

                        this.evaluadorExternoSeleccionado =
                            this.mapEvaluadorExternoLabel(
                                data.evaluadorExterno
                            );
                        this.trabajoDeGradoService.setEvaluadorExternoSeleccionadoSubject(
                            this.evaluadorExternoSeleccionado
                        );
                        this.evaluadorExterno.setValue(
                            data.evaluadorExterno.id
                        );
                    }

                    if (responses.coordinadorFase1) {
                        this.isCoordinadorFase1Created = true;
                        const data = responses.coordinadorFase1;
                        this.solicitudForm
                            .get('conceptoCoordinadorDocumentos')
                            .setValue(
                                data.conceptoCoordinadorDocumentos == 'ACEPTADO'
                                    ? 'Aceptado'
                                    : 'Rechazado'
                            );
                    }

                    if (responses.coordinadorFase2) {
                        this.isCoordinadorFase2Created = true;
                        const data = responses.coordinadorFase2;
                        this.setValuesForm(data);

                        const lastIdx: number =
                            data.actaFechaRespuestaComite.length - 1;
                        const lastActa = data.actaFechaRespuestaComite[lastIdx];

                        const actaDate = lastActa?.fechaActa;
                        const actaNumber = lastActa?.numeroActa;
                        const actaConceptoComite = lastActa?.conceptoComite;

                        this.solicitudForm
                            .get('fechaActa')
                            .setValue(actaDate ? new Date(actaDate) : null);

                        this.solicitudForm
                            .get('numeroActa')
                            .setValue(actaNumber ? actaNumber : null);

                        this.solicitudForm
                            .get('conceptoComite')
                            .setValue(
                                actaConceptoComite == 'APROBADO'
                                    ? 'Avalado'
                                    : 'No Avalado'
                            );

                        this.solicitudForm
                            .get('fechaMaximaEvaluacion')
                            .setValue(
                                data?.fechaMaximaEvaluacion
                                    ? new Date(data.fechaMaximaEvaluacion)
                                    : null
                            );
                    }
                },
                error: (e) => this.handlerResponseException(e),
                complete: () => {
                    if (
                        this.role.includes('ROLE_DOCENTE') &&
                        this.isDocenteCreated
                    ) {
                        this.setup('linkFormatoA');
                        this.setup('linkFormatoD');
                        this.setup('linkFormatoE');
                        this.setup('anexos');
                    }
                    if (this.role.includes('ROLE_COORDINADOR')) {
                        this.setup('linkFormatoA');
                        this.setup('linkFormatoD');
                        this.setup('linkFormatoE');
                        this.setup('anexos');
                        if (this.isCoordinadorFase2Created) {
                            this.setup('linkOficioDirigidoEvaluadores');
                        }
                    }
                    this.isLoading = false;
                    resolve();
                },
            });
        });
    }

    onFileSelectFormatoA(event: any) {
        this.FileFormatoA = this.uploadFileAndSetValue('linkFormatoA', event);
    }

    onFileSelectFormatoD(event: any) {
        this.FileFormatoD = this.uploadFileAndSetValue('linkFormatoD', event);
    }

    onFileSelectFormatoE(event: any) {
        this.FileFormatoE = this.uploadFileAndSetValue('linkFormatoE', event);
    }

    onFileSelectOficioDirigidoEvaluadores(event: any) {
        this.FileOficioDirigidoEvaluadores = this.uploadFileAndSetValue(
            'linkOficioDirigidoEvaluadores',
            event
        );
    }

    onFileClear(field: string) {
        if (field == 'linkFormatoA') {
            this.FileFormatoA = null;
            this.FormatoA.clear();
            this.solicitudForm.get('linkFormatoA').reset();
        }
        if (field == 'linkFormatoD') {
            this.FileFormatoD = null;
            this.FormatoD.clear();
            this.solicitudForm.get('linkFormatoD').reset();
        }
        if (field == 'linkFormatoE') {
            this.FileFormatoE = null;
            this.FormatoE.clear();
            this.solicitudForm.get('linkFormatoE').reset();
        }
        if (field == 'linkOficioDirigidoEvaluadores') {
            this.FileOficioDirigidoEvaluadores = null;
            this.OficioDirigidoEvaluadores.clear();
            this.solicitudForm.get('linkOficioDirigidoEvaluadores').reset();
        }
    }

    async formatFileString(file: any, fileControlName: string): Promise<any> {
        try {
            if (fileControlName === 'anexos') {
                const files = await Promise.all(
                    file.map(async (anexo: any) => {
                        const base64 = await this.convertFileToBase64(anexo);
                        return `${base64}`;
                    })
                );
                return files;
            } else {
                const base64 = await this.convertFileToBase64(file);
                return `${base64}`;
            }
        } catch (error) {
            console.error('Error al convertir el archivo a base64:', error);
            throw error;
        }
    }

    convertFileToBase64(file: File | Blob): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (!(file instanceof File || file instanceof Blob)) {
                reject(new Error('El parámetro no es de tipo File o Blob'));
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result as string;
                const base64 = base64String.split(',')[1];
                resolve(base64);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsDataURL(file);
        });
    }

    uploadFileAndSetValue(fileControlName: string, event: any) {
        const selectedFiles: FileList = event.files;
        const maxFileSize = 5000000; // 5 MB
        if (selectedFiles && selectedFiles.length > 0) {
            const selectedFile = selectedFiles[0];
            if (selectedFile.size > maxFileSize) {
                this.messageService.add(
                    errorMessage(Aviso.ARCHIVO_DEMASIADO_GRANDE)
                );
                return null;
            }
            const fileType = selectedFile.type.split('/')[1];
            this.convertFileToBase64(selectedFile)
                .then((base64) => {
                    this.solicitudForm
                        .get(fileControlName)
                        .setValue(`${fileControlName}.${fileType}-${base64}`);
                })
                .catch((error) => {
                    console.error(
                        'Error al convertir el archivo a base64:',
                        error
                    );
                });
            return selectedFile;
        }
        return null;
    }

    downloadFile = (
        response: string,
        rutaArchivo: string,
        downloadName: string
    ) => {
        const byteCharacters = atob(response);
        const byteNumbers = new Array(byteCharacters.length)
            .fill(0)
            .map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray]);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        const extension = rutaArchivo.slice(rutaArchivo.lastIndexOf('.') + 1);

        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = `${downloadName}.${extension}`;
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    getFileAndSetValue(fieldName: string) {
        let errorShown = false;

        const handleError = () => {
            if (!errorShown) {
                this.messageService.add(
                    warnMessage('Modifica la información para ver los cambios.')
                );
                errorShown = true;
            }
        };

        if (fieldName === 'anexos') {
            for (const anexo of this.solicitudForm.get(fieldName).value) {
                this.trabajoDeGradoService.getFile(anexo).subscribe({
                    next: (response: string) =>
                        this.downloadFile(response, anexo, fieldName),
                    error: handleError,
                });
            }
        } else {
            const rutaArchivo = this.solicitudForm.get(fieldName).value;
            this.trabajoDeGradoService.getFile(rutaArchivo).subscribe({
                next: (response: string) =>
                    this.downloadFile(response, rutaArchivo, fieldName),
                error: handleError,
            });
        }
    }

    getFormControl(formControlName: string): FormControl {
        return this.solicitudForm.get(formControlName) as FormControl;
    }

    showBuscadorEvaluadorInterno() {
        return this.dialogService.open(BuscadorDocentesComponent, {
            header: 'Seleccionar docente',
            width: '60%',
        });
    }

    showBuscadorEvaluadorExterno() {
        return this.dialogService.open(BuscadorExpertosComponent, {
            header: 'Seleccionar experto',
            width: '60%',
        });
    }

    onSeleccionarEvaluadorInterno() {
        const ref = this.showBuscadorEvaluadorInterno();
        ref.onClose.subscribe({
            next: (response) => {
                if (response) {
                    const docente = this.mapEvaluadorInternoLabel(response);
                    this.evaluadorInternoSeleccionado = docente;
                    this.trabajoDeGradoService.setEvaluadorInternoSeleccionadoSubject(
                        this.evaluadorInternoSeleccionado
                    );
                    this.evaluadorInterno.setValue(docente.id);
                }
            },
        });
    }

    onSeleccionarEvaluadorExterno() {
        const ref = this.showBuscadorEvaluadorExterno();
        ref.onClose.subscribe({
            next: (response) => {
                if (response) {
                    const experto = this.mapEvaluadorExternoLabel(response);
                    this.evaluadorExternoSeleccionado = experto;
                    this.trabajoDeGradoService.setEvaluadorExternoSeleccionadoSubject(
                        this.evaluadorExternoSeleccionado
                    );
                    this.evaluadorExterno.setValue(experto.id);
                }
            },
        });
    }

    limpiarEvaluadorExterno() {
        this.evaluadorExterno.setValue(null);
        this.evaluadorExternoSeleccionado = null;
    }

    limpiarEvaluadorInterno() {
        this.evaluadorInterno.setValue(null);
        this.evaluadorInternoSeleccionado = null;
    }

    redirectToRespuesta() {
        this.router.navigate(['examen-de-valoracion/respuesta']);
    }

    redirectToResolucion(resolucionId: number) {
        resolucionId
            ? this.router.navigate([
                  `examen-de-valoracion/resolucion/editar/${this.trabajoDeGradoId}`,
              ])
            : this.router.navigate(['examen-de-valoracion/resolucion']);
    }

    redirectToSustentacion(sustentacionId: number) {
        sustentacionId
            ? this.router.navigate([
                  `examen-de-valoracion/sustentacion/editar/${this.trabajoDeGradoId}`,
              ])
            : this.router.navigate(['examen-de-valoracion/sustentacion']);
    }

    redirectToBandeja() {
        this.router.navigate(['examen-de-valoracion']);
    }

    handlerResponseException(response: any) {
        if (response.status != 500 && response.status != 409) return;
        const mapException = mapResponseException(response.error);
        mapException.forEach((value, _) => {
            this.messageService.add(errorMessage(value));
        });
    }

    mapEvaluadorInternoLabel(docente: any) {
        return {
            id: docente.id,
            nombres: docente.nombres ?? docente.nombre + ' ' + docente.apellido,
            correo: docente.correoElectronico ?? docente.correo,
            universidad: docente.universidad,
        };
    }

    mapEvaluadorExternoLabel(experto: any) {
        return {
            id: experto.id,
            nombres: experto.nombres ?? experto.nombre + ' ' + experto.apellido,
            correo: experto.correoElectronico ?? experto.correo,
            universidad: experto.universidad,
        };
    }

    isActiveIndex(): Boolean {
        if (this.router.url.includes('solicitud')) {
            return true;
        }
        return false;
    }

    getButtonLabel(): string {
        if (this.role.includes('ROLE_DOCENTE') && this.isDocenteCreated) {
            return 'Modificar Informacion';
        } else if (
            this.role.includes('ROLE_COORDINADOR') &&
            this.isCoordinadorFase1Created &&
            this.isCoordinadorFase2Created
        ) {
            return 'Modificar Informacion';
        } else {
            return 'Guardar';
        }
    }
}
