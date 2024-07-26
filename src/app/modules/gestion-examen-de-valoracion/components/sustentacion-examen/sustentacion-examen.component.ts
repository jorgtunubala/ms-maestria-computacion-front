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
    firstValueFrom,
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
import { BuscadorDocentesComponent } from 'src/app/shared/components/buscador-docentes/buscador-docentes.component';
import { BuscadorExpertosComponent } from 'src/app/shared/components/buscador-expertos/buscador-expertos.component';
import { DocenteService } from 'src/app/shared/services/docente.service';
import { ExpertoService } from 'src/app/shared/services/experto.service';
import { Estudiante } from '../../../gestion-estudiantes/models/estudiante';
import { SustentacionService } from '../../services/sustentacion.service';
import { TrabajoDeGradoService } from '../../services/trabajoDeGrado.service';
import { Experto } from '../../models/experto';
import { Sustentacion } from '../../models/sustentacion';
import { AutenticacionService } from 'src/app/modules/gestion-autenticacion/services/autenticacion.service';

@Component({
    selector: 'app-sustentacion-examen',
    templateUrl: './sustentacion-examen.component.html',
    styleUrls: ['./sustentacion-examen.component.scss'],
})
export class SustentacionExamenComponent implements OnInit {
    @Output() formReady = new EventEmitter<FormGroup>();
    sustentacionForm: FormGroup;

    private estudianteSubscription: Subscription;
    private trabajoSeleccionadoSubscription: Subscription;
    private resolucionSubscription: Subscription;
    private sustentacionSubscription: Subscription;
    private evaluadorInternoSubscription: Subscription;
    private evaluadorExternoSubscription: Subscription;

    @ViewChild('FormatoF') FormatoF!: FileUpload;
    @ViewChild('Monografia') Monografia!: FileUpload;
    @ViewChild('FormatoG') FormatoG!: FileUpload;
    @ViewChild('EstudioHVA') EstudioHVA!: FileUpload;
    @ViewChild('OficioConsejo') OficioConsejo!: FileUpload;
    @ViewChild('FormatoH') FormatoH!: FileUpload;
    @ViewChild('FormatoI') FormatoI!: FileUpload;
    @ViewChild('ActaSustentacionP') ActaSustentacionP!: FileUpload;
    @ViewChild('EstudioHVAGrado') EstudioHVAGrado!: FileUpload;

    FileFormatoF: File | null = null;
    FileMonografia: File | null = null;
    FileFormatoG: File | null = null;
    FileEstudioHVA: File | null = null;
    FileOficioConsejo: File | null = null;
    FileFormatoH: File | null = null;
    FileFormatoI: File | null = null;
    FileActaSustentacionP: File | null = null;
    FileEstudioHVAGrado: File | null = null;

    editMode: boolean = false;
    errorMessageShown: boolean = false;
    displayModal: boolean = false;
    displayFormatoHVA: boolean = false;
    displayFormatoHVAGrado: boolean = false;
    displayFormatoF: boolean = false;
    displayFormatoG: boolean = false;
    isPdfLoaded: boolean = false;
    isDocente: boolean = false;
    isCoordinadorFase1: boolean = false;
    isEstudiante: boolean = false;
    isCoordinadorFase2: boolean = false;
    isFechaSustentacion: boolean = false;
    isCoordinadorFase3: boolean = false;
    isCoordinadorFase4: boolean = false;
    isDocenteCreated: boolean = false;
    isCoordinadorFase1Created: boolean = false;
    isEstudianteCreated: boolean = false;
    isCoordinadorFase2Created: boolean = false;
    isCoordinadorFase3Created: boolean = false;
    isCoordinadorFase4Created: boolean = false;
    isLoading: boolean = false;
    isChanged: boolean = false;
    isReviewed: boolean = false;

    pdfUrls: { name: string; url: string }[] = [];
    role: string[];
    anexosFiles: File[] = [];
    anexosBase64: { linkAnexo: string }[] = [];
    estado: string;

    trabajoDeGradoId: number;
    respuestaId: number;
    resolucionId: number;
    sustentacionId: number;
    currentPdfIndex: number = 0;

    estudianteSeleccionado: Estudiante = {};
    juradoExternoSeleccionado: Experto;
    juradoInternoSeleccionado: Docente;

    estados: string[] = ['Aceptado', 'Rechazado'];
    estadosComite: string[] = ['Aprobado', 'No Aprobado'];
    respuestas: string[] = ['Aprobado', 'No Aprobado', 'Aplazado'];

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private trabajoDeGradoService: TrabajoDeGradoService,
        private sustentacionService: SustentacionService,
        private dialogService: DialogService,
        private messageService: MessageService,
        private autenticacion: AutenticacionService,
        private docenteService: DocenteService,
        private expertoService: ExpertoService
    ) {}

    get juradoInterno(): FormControl {
        return this.sustentacionForm.get('idJuradoInterno') as FormControl;
    }

    get juradoExterno(): FormControl {
        return this.sustentacionForm.get('idJuradoExterno') as FormControl;
    }

    ngOnInit() {
        this.role = this.autenticacion.getRole();
        this.initForm();
        this.subscribeToObservers();
        if (this.router.url.includes('editar')) {
            this.loadEditMode();
        }
        this.checkEstados();
    }

    async loadEditMode() {
        this.editMode = true;
        await this.loadSustentacion();
    }

    initForm(): void {
        this.sustentacionForm = this.fb.group({
            linkFormatoF: [null, Validators.required],
            linkMonografia: [null, Validators.required],
            anexos: [[], Validators.required],
            asuntoCoordinador: [null],
            mensajeCoordinador: [null],
            conceptoCoordinador: [null, Validators.required],
            asuntoComite: [null],
            mensajeComite: [null],
            conceptoComite: [null, Validators.required],
            linkFormatoG: [null, Validators.required],
            linkEstudioHojaVidaAcademica: [null, Validators.required],
            linkOficioConsejo: [null, Validators.required],
            numeroActa: [null, Validators.required],
            fechaActa: [null, Validators.required],
            nota: [null],
            juradosAceptados: [null],
            idJuradoInterno: [null, Validators.required],
            idJuradoExterno: [null, Validators.required],
            fechaSustentacion: [null, Validators.required],
            numeroActaConsejo: [null, Validators.required],
            fechaActaConsejo: [null, Validators.required],
            linkFormatoH: [null, Validators.required],
            linkFormatoI: [null, Validators.required],
            linkEstudioHojaVidaAcademicaGrado: [null, Validators.required],
            respuestaSustentacion: [null, Validators.required],
            linkActaSustentacionPublica: [null, Validators.required],
            numeroActaFinal: [null, Validators.required],
            fechaActaFinal: [null, Validators.required],
        });

        this.formReady.emit(this.sustentacionForm);

        this.sustentacionForm
            .get('conceptoCoordinador')
            .valueChanges.subscribe((value) => {
                if (value == 'Rechazado') {
                    this.sustentacionForm
                        .get('asuntoCoordinador')
                        .setValue('Solicitud envio a comite');
                    this.sustentacionForm
                        .get('mensajeCoordinador')
                        .setValue(
                            'Comedidamente solicito revisar los documentos.'
                        );
                }
            });

        this.sustentacionForm
            .get('conceptoComite')
            .valueChanges.subscribe((value) => {
                if (value == 'Aprobado') {
                    this.sustentacionForm
                        .get('asuntoComite')
                        .setValue(
                            'Solicitud de revision sustentacion de valoracion'
                        );

                    this.sustentacionForm
                        .get('mensajeComite')
                        .setValue(
                            'Solicito comedidamente revisar el sustentacion de valoracion del estudiante para aprobacion.'
                        );
                }
                if (value == 'No Aprobado') {
                    this.sustentacionForm
                        .get('asuntoComite')
                        .setValue('Informacion revision comite');
                    this.sustentacionForm
                        .get('mensajeComite')
                        .setValue(
                            'La respuesta del comite ha sido rechazada, por favor corregir.'
                        );
                }
            });

        this.sustentacionForm
            .get('juradosAceptados')
            .valueChanges.subscribe((value) => {
                if (value == 'Aceptado') {
                    this.juradoInterno.setValue(
                        this.juradoInternoSeleccionado.id
                    );
                    this.juradoExterno.setValue(
                        this.juradoExternoSeleccionado.id
                    );
                    this.sustentacionForm
                        .get('nota')
                        .setValue(
                            'Los jurados fueron aceptados mediante oficio xxx del consejo de facultad.'
                        );
                }
                if (value == 'Rechazado') {
                    this.sustentacionForm
                        .get('nota')
                        .setValue(
                            'Se cambia el jurado x por x por tal situación.'
                        );
                }
            });
    }

    updateFormFields(role: string[]): void {
        const formControls = this.sustentacionForm.controls;

        for (const control in formControls) {
            formControls[control].disable();
        }

        if (role.includes('ROLE_DOCENTE')) {
            formControls['linkFormatoF'].enable();
            formControls['linkMonografia'].enable();
            formControls['anexos'].enable();
            formControls['idJuradoInterno'].enable();
            formControls['idJuradoExterno'].enable();
        }

        if (role.includes('ROLE_COORDINADOR')) {
            if (this.isDocente && !this.isCoordinadorFase1) {
                formControls['asuntoCoordinador'].enable();
                formControls['mensajeCoordinador'].enable();
                formControls['conceptoCoordinador'].enable();
            }

            if (this.isCoordinadorFase1 && !this.isCoordinadorFase2) {
                formControls['asuntoComite'].enable();
                formControls['mensajeComite'].enable();
                formControls['conceptoComite'].enable();
                formControls['numeroActa'].enable();
                formControls['fechaActa'].enable();
                this.sustentacionForm
                    .get('conceptoComite')
                    .valueChanges.subscribe((value) => {
                        if (value == 'Aprobado') {
                            this.isReviewed = false;
                            formControls['linkFormatoG'].enable();
                            formControls[
                                'linkEstudioHojaVidaAcademica'
                            ].enable();
                        } else if (value == 'No Aprobado') {
                            this.isReviewed = true;
                            formControls['linkFormatoG'].disable();
                            formControls[
                                'linkEstudioHojaVidaAcademica'
                            ].disable();
                        }
                    });
            }

            if (this.isCoordinadorFase2 && !this.isCoordinadorFase3) {
                formControls['juradosAceptados'].enable();
                formControls['nota'].enable();
                formControls['idJuradoInterno'].enable();
                formControls['idJuradoExterno'].enable();
                formControls['linkOficioConsejo'].enable();
                formControls['numeroActaConsejo'].enable();
                formControls['fechaActaConsejo'].enable();

                if (this.isFechaSustentacion) {
                    formControls['fechaSustentacion'].enable();
                    formControls['juradosAceptados'].disable();
                }
            }

            if (this.isEstudiante) {
                formControls['respuestaSustentacion'].enable();
                this.sustentacionForm
                    .get('respuestaSustentacion')
                    .valueChanges.subscribe((value) => {
                        if (value == 'Aprobado') {
                            formControls[
                                'linkActaSustentacionPublica'
                            ].enable();
                            formControls['numeroActaFinal'].enable();
                            formControls['fechaActaFinal'].enable();
                        } else {
                            formControls[
                                'linkActaSustentacionPublica'
                            ].disable();
                            formControls['numeroActaFinal'].disable();
                            formControls['fechaActaFinal'].disable();
                        }
                    });
            }
        }

        if (role.includes('ROLE_ESTUDIANTE')) {
            if (this.isCoordinadorFase3 && !this.isEstudiante) {
                formControls['linkFormatoH'].enable();
                formControls['linkFormatoI'].enable();
                formControls['linkEstudioHojaVidaAcademicaGrado'].enable();
            }
        }
    }

    subscribeToObservers() {
        this.estudianteSubscription =
            this.trabajoDeGradoService.estudianteSeleccionado$.subscribe({
                next: (response) => {
                    if (response) {
                        this.estudianteSeleccionado = response;
                    } else {
                        this.router.navigate(['examen-de-valoracion']);
                    }
                },
                error: (e) => this.handlerResponseException(e),
            });

        this.trabajoSeleccionadoSubscription =
            this.trabajoDeGradoService.trabajoSeleccionadoSubject$.subscribe({
                next: (response) => {
                    if (response) {
                        this.trabajoDeGradoId = response.id;
                        this.estado = response.estado;
                        if (
                            this.estado ==
                                EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_DOCENTE_SUSTENTACION &&
                            this.role.includes('ROLE_COORDINADOR')
                        ) {
                            this.router.navigate(['examen-de-valoracion']);
                        }
                    }
                },
                error: (e) => this.handlerResponseException(e),
            });

        this.resolucionSubscription =
            this.trabajoDeGradoService.resolucionSeleccionadaSubject$.subscribe(
                {
                    next: (response) => {
                        if (response) {
                            this.resolucionId = response.id;
                        }
                    },
                    error: (e) => this.handlerResponseException(e),
                }
            );

        this.sustentacionSubscription =
            this.trabajoDeGradoService.sustentacionSeleccionadaSubject$.subscribe(
                {
                    next: (response) => {
                        if (response) {
                            this.sustentacionId = response.id;
                        }
                    },
                    error: (e) => this.handlerResponseException(e),
                }
            );

        this.evaluadorExternoSubscription =
            this.trabajoDeGradoService.evaluadorExternoSeleccionadoSubject$.subscribe(
                {
                    next: (response) => {
                        if (response) {
                            this.juradoExternoSeleccionado = response;
                            this.juradoExterno?.setValue(response.id);
                        }
                    },
                    error: (e) => this.handlerResponseException(e),
                }
            );

        this.evaluadorInternoSubscription =
            this.trabajoDeGradoService.evaluadorInternoSeleccionadoSubject$.subscribe(
                {
                    next: (response) => {
                        if (response) {
                            this.juradoInternoSeleccionado = response;
                            this.juradoInterno?.setValue(response.id);
                        }
                    },
                    error: (e) => this.handlerResponseException(e),
                }
            );
    }

    async setup(fieldName: string) {
        if (fieldName === 'anexos') {
            for (const anexo of this.sustentacionForm.get(fieldName).value) {
                try {
                    const response = await firstValueFrom(
                        this.trabajoDeGradoService.getFile(anexo)
                    );
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
                        this.anexosFiles.push(file);
                    }
                } catch {
                    if (!this.errorMessageShown) {
                        this.messageService.add(
                            warnMessage('Pendiente subir archivos.')
                        );
                        this.errorMessageShown = true;
                    }
                }
            }
        } else {
            const rutaArchivo = this.sustentacionForm.get(fieldName).value;
            try {
                const response = await firstValueFrom(
                    this.trabajoDeGradoService.getFile(rutaArchivo)
                );
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
                        case 'linkFormatoF':
                            this.FileFormatoF = file;
                            break;
                        case 'linkMonografia':
                            this.FileMonografia = file;
                            break;
                        case 'linkFormatoG':
                            this.FileFormatoG = file;
                            break;
                        case 'linkEstudioHojaVidaAcademica':
                            this.FileEstudioHVA = file;
                            break;
                        case 'linkOficioConsejo':
                            this.FileOficioConsejo = file;
                            break;
                        case 'linkFormatoH':
                            this.FileFormatoH = file;
                            break;
                        case 'linkFormatoI':
                            this.FileFormatoI = file;
                            break;
                        case 'linkEstudioHojaVidaAcademicaGrado':
                            this.FileEstudioHVAGrado = file;
                            break;
                        case 'linkActaSustentacionPublica':
                            this.FileActaSustentacionP = file;
                            break;
                        default:
                            break;
                    }
                }
            } catch {
                if (!this.errorMessageShown) {
                    this.messageService.add(
                        warnMessage('Pendiente subir archivos.')
                    );
                    this.errorMessageShown = true;
                }
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
        if (this.sustentacionSubscription) {
            this.sustentacionSubscription.unsubscribe();
        }
        if (this.resolucionSubscription) {
            this.resolucionSubscription.unsubscribe();
        }
        if (this.evaluadorExternoSubscription) {
            this.evaluadorExternoSubscription.unsubscribe();
        }
        if (this.evaluadorInternoSubscription) {
            this.evaluadorInternoSubscription.unsubscribe();
        }
    }

    checkEstados() {
        switch (this.estado) {
            case EstadoProceso.DEVUELTO_SUSTENTACION_PARA_CORREGIR_AL_DOCENTE_COORDINADOR:
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: EstadoProceso.DEVUELTO_SUSTENTACION_PARA_CORREGIR_AL_DOCENTE_COORDINADOR,
                    life: 2000,
                });
                this.isDocente = true;
                this.isCoordinadorFase1 = false;
                this.isCoordinadorFase2 = false;
                this.isCoordinadorFase3 = false;
                this.isEstudiante = false;
                this.isCoordinadorFase4 = false;
                break;

            case EstadoProceso.DEVUELTO_SUSTENTACION_PARA_CORREGIR_AL_DOCENTE_COMITE:
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: EstadoProceso.DEVUELTO_SUSTENTACION_PARA_CORREGIR_AL_DOCENTE_COMITE,
                    life: 2000,
                });
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isCoordinadorFase2 = false;
                this.isCoordinadorFase3 = false;
                this.isEstudiante = false;
                this.isCoordinadorFase4 = false;
                break;

            case EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_DOCENTE_SUSTENTACION:
                this.messageService.add({
                    severity: 'info',
                    summary: 'Informacion',
                    detail: EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_DOCENTE_SUSTENTACION,
                    life: 2000,
                });
                this.isDocente = false;
                this.isCoordinadorFase1 = false;
                this.isCoordinadorFase2 = false;
                this.isCoordinadorFase3 = false;
                this.isEstudiante = false;
                this.isCoordinadorFase4 = false;
                break;

            case EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE1_SUSTENTACION:
                this.isDocente = true;
                this.isCoordinadorFase1 = false;
                this.isCoordinadorFase2 = false;
                this.isCoordinadorFase3 = false;
                this.isEstudiante = false;
                this.isCoordinadorFase4 = false;
                break;

            case EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE2_SUSTENTACION:
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isCoordinadorFase2 = false;
                this.isCoordinadorFase3 = false;
                this.isEstudiante = false;
                this.isCoordinadorFase4 = false;
                break;

            case EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE3_SUSTENTACION:
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isCoordinadorFase2 = true;
                this.isCoordinadorFase3 = false;
                this.isEstudiante = false;
                this.isCoordinadorFase4 = false;
                break;

            case EstadoProceso.SIN_ACTUALIZAR_FECHA_SUSTENTACION:
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isCoordinadorFase2 = true;
                this.isFechaSustentacion = true;
                this.isCoordinadorFase3 = false;
                this.isEstudiante = false;
                this.isCoordinadorFase4 = false;
                break;

            case EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_ESTUDIANTE_SUSTENTACION:
                this.messageService.add({
                    severity: 'info',
                    summary: 'Informacion',
                    detail: EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_ESTUDIANTE_SUSTENTACION,
                    life: 2000,
                });
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isCoordinadorFase2 = true;
                this.isCoordinadorFase3 = true;
                this.isEstudiante = false;
                this.isCoordinadorFase4 = false;
                break;

            case EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE4_SUSTENTACION:
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isCoordinadorFase2 = true;
                this.isCoordinadorFase3 = true;
                this.isEstudiante = true;
                this.isCoordinadorFase4 = false;
                break;
            case EstadoProceso.SUSTENTACION_APROBADA:
                this.messageService.add({
                    severity: 'success',
                    summary: 'Informacion',
                    detail: EstadoProceso.SUSTENTACION_APROBADA,
                    life: 2000,
                });
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isEstudiante = true;
                this.isCoordinadorFase2 = true;
                this.isCoordinadorFase3 = true;
                this.isCoordinadorFase4 = true;
                break;

            case EstadoProceso.SUSTENTACION_NO_APROBADA:
                this.messageService.add({
                    severity: 'error',
                    summary: 'Informacion',
                    detail: EstadoProceso.SUSTENTACION_NO_APROBADA,
                    life: 2000,
                });
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isEstudiante = true;
                this.isCoordinadorFase2 = true;
                this.isCoordinadorFase3 = true;
                this.isCoordinadorFase4 = true;
                break;

            case EstadoProceso.SUSTENTACION_APLAZADA:
                this.messageService.add({
                    severity: 'error',
                    summary: 'Informacion',
                    detail: EstadoProceso.SUSTENTACION_APLAZADA,
                    life: 2000,
                });
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isEstudiante = true;
                this.isCoordinadorFase2 = true;
                this.isCoordinadorFase3 = true;
                this.isCoordinadorFase4 = true;
                break;

            default:
                this.isDocente = true;
                this.isCoordinadorFase1 = true;
                this.isEstudiante = true;
                this.isCoordinadorFase2 = true;
                this.isCoordinadorFase3 = true;
                this.isCoordinadorFase4 = true;
                break;
        }

        this.updateFormFields(this.role);
    }

    //#region PDF VIEWER
    async loadPdfFiles() {
        const filesToConvert = [];

        if (
            this.estado ==
                EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_DOCENTE_SUSTENTACION ||
            this.estado ==
                EstadoProceso.DEVUELTO_SUSTENTACION_PARA_CORREGIR_AL_DOCENTE_COORDINADOR ||
            this.estado ==
                EstadoProceso.DEVUELTO_SUSTENTACION_PARA_CORREGIR_AL_DOCENTE_COMITE
        ) {
            filesToConvert.push(
                {
                    file: this.FileMonografia,
                    fieldName: 'Monografia',
                },
                {
                    file: this.FileFormatoF,
                    fieldName: 'Formato F',
                },
                ...this.anexosFiles.map((file) => ({
                    file,
                    fieldName: 'Anexo',
                }))
            );
        }

        if (
            this.estado ==
            EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE1_SUSTENTACION
        ) {
            filesToConvert.push({
                file: this.FileMonografia,
                fieldName: 'Monografia',
            });
        }

        if (
            this.estado ==
            EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE2_SUSTENTACION
        ) {
            filesToConvert.push(
                {
                    file: this.FileFormatoG,
                    fieldName: 'Formato G',
                },
                {
                    file: this.FileEstudioHVA,
                    fieldName: 'Estudio Hoja de Vida Academica',
                }
            );
        }

        if (
            this.estado ==
                EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE3_SUSTENTACION ||
            this.estado == EstadoProceso.SIN_ACTUALIZAR_FECHA_SUSTENTACION
        ) {
            filesToConvert.push({
                file: this.FileOficioConsejo,
                fieldName: 'Carta de aceptación nombramiento de jurados',
            });
        }

        if (
            this.estado ==
            EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_ESTUDIANTE_SUSTENTACION
        ) {
            filesToConvert.push(
                {
                    file: this.FileFormatoH,
                    fieldName: 'Formato H',
                },
                {
                    file: this.FileFormatoI,
                    fieldName: 'Formato I',
                },
                {
                    file: this.FileEstudioHVAGrado,
                    fieldName: 'Estudio Hoja de Vida Academica para Grado',
                }
            );
        }

        if (
            this.estado ==
            EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE4_SUSTENTACION
        ) {
            filesToConvert.push({
                file: this.FileActaSustentacionP,
                fieldName: 'Acta de Sustentación Publica',
            });
        }

        const errorFiles = new Set<File>();

        try {
            for (const item of filesToConvert) {
                const { file, fieldName } = item;
                if (file) {
                    try {
                        const url = URL.createObjectURL(file);
                        this.pdfUrls.push({ name: `${fieldName}`, url });
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
        this.pdfUrls = [];
    }
    //#endregion

    showFormatoHVA() {
        this.displayFormatoHVA = true;
    }

    showFormatoHVAGrado() {
        this.displayFormatoHVAGrado = true;
    }

    showFormatoF() {
        this.displayFormatoF = true;
    }

    showFormatoG() {
        this.displayFormatoG = true;
    }

    handleFormatoHvaGradoPdfGenerated(file: File) {
        const pdfFile = new File([file], 'EstudioHojaVidaAcademicaGrado.pdf', {
            type: 'application/pdf',
        });
        this.FileEstudioHVAGrado = pdfFile;
        this.convertFileToBase64(pdfFile)
            .then((base64) => {
                this.sustentacionForm
                    .get('linkEstudioHojaVidaAcademicaGrado')
                    .setValue(
                        `linkEstudioHojaVidaAcademicaGrado.pdf-${base64}`
                    );
            })
            .catch((error) => {
                console.error('Error al convertir el archivo a base64:', error);
            });
    }

    handleFormatoFGenerated(file: File) {
        const pdfFile = new File([file], 'FormatoF.pdf', {
            type: 'application/pdf',
        });
        this.FileFormatoF = pdfFile;
        this.convertFileToBase64(pdfFile)
            .then((base64) => {
                this.sustentacionForm
                    .get('linkFormatoF')
                    .setValue(`linkFormatoF.pdf-${base64}`);
            })
            .catch((error) => {
                console.error('Error al convertir el archivo a base64:', error);
            });
    }

    handleFormatoGGenerated(file: File) {
        const pdfFile = new File([file], 'FormatoG.pdf', {
            type: 'application/pdf',
        });
        this.FileFormatoG = pdfFile;
        this.convertFileToBase64(pdfFile)
            .then((base64) => {
                this.sustentacionForm
                    .get('linkFormatoG')
                    .setValue(`linkFormatoG.pdf-${base64}`);
            })
            .catch((error) => {
                console.error('Error al convertir el archivo a base64:', error);
            });
    }

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
                    this.sustentacionForm.patchValue({
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

    setValuesForm(sustentacion: Sustentacion) {
        this.sustentacionForm.patchValue({
            ...sustentacion,
        });
    }

    async loadJuradoExterno() {
        try {
            const idJuradoExterno =
                this.sustentacionForm.get('idJuradoExterno').value;
            const response = await firstValueFrom(
                this.expertoService.obtenerExperto(idJuradoExterno)
            );
            if (response) {
                this.juradoExternoSeleccionado =
                    this.mapJuradoExternoLabel(response);
                this.juradoExterno.setValue(response.id);
            }
        } catch (error) {
            console.error('Error al obtener el jurado externo:', error);
        }
    }

    async loadJuradoInterno() {
        try {
            const idJuradoInterno =
                this.sustentacionForm.get('idJuradoInterno').value;
            const response = await firstValueFrom(
                this.docenteService.obtenerDocente(idJuradoInterno)
            );
            if (response) {
                this.juradoInternoSeleccionado =
                    this.mapJuradoInternoLabel(response);
                this.juradoInterno.setValue(response.id);
            }
        } catch (error) {
            console.error('Error al obtener el jurado interno:', error);
        }
    }

    loadSustentacion(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.isLoading = true;
            const docenteObs =
                this.role.includes('ROLE_DOCENTE') ||
                this.role.includes('ROLE_COORDINADOR')
                    ? this.sustentacionService
                          .getSustentacionDocente(this.trabajoDeGradoId)
                          .pipe(
                              catchError(() => {
                                  this.isDocenteCreated = false;
                                  return of(null);
                              })
                          )
                    : of(null);
            const coordinadorFase1Obs = this.role.includes('ROLE_COORDINADOR')
                ? this.sustentacionService
                      .getSustentacionCoordinadorFase1(this.trabajoDeGradoId)
                      .pipe(
                          catchError(() => {
                              this.isCoordinadorFase1Created = false;
                              return of(null);
                          })
                      )
                : of(null);
            const coordinadorFase2Obs = this.role.includes('ROLE_COORDINADOR')
                ? this.sustentacionService
                      .getSustentacionCoordinadorFase2(this.trabajoDeGradoId)
                      .pipe(
                          catchError(() => {
                              this.isCoordinadorFase2Created = false;
                              return of(null);
                          })
                      )
                : of(null);
            const coordinadorFase3Obs = this.role.includes('ROLE_COORDINADOR')
                ? this.sustentacionService
                      .getSustentacionCoordinadorFase3(this.trabajoDeGradoId)
                      .pipe(
                          catchError(() => {
                              this.isCoordinadorFase3Created = false;
                              return of(null);
                          })
                      )
                : of(null);
            const estudianteObs =
                this.role.includes('ROLE_COORDINADOR') ||
                this.role.includes('ROLE_ESTUDIANTE')
                    ? this.sustentacionService
                          .getSustentacionEstudiante(this.trabajoDeGradoId)
                          .pipe(
                              catchError(() => {
                                  this.isEstudianteCreated = false;
                                  return of(null);
                              })
                          )
                    : of(null);
            const coordinadorFase4Obs = this.role.includes('ROLE_COORDINADOR')
                ? this.sustentacionService
                      .getSustentacionCoordinadorFase4(this.trabajoDeGradoId)
                      .pipe(
                          catchError(() => {
                              this.isCoordinadorFase4Created = false;
                              return of(null);
                          })
                      )
                : of(null);

            forkJoin({
                docente: docenteObs,
                coordinadorFase1: coordinadorFase1Obs,
                coordinadorFase2: coordinadorFase2Obs,
                estudiante: estudianteObs,
                coordinadorFase3: coordinadorFase3Obs,
                coordinadorFase4: coordinadorFase4Obs,
            }).subscribe({
                next: (responses) => {
                    if (responses.docente) {
                        this.isDocenteCreated = true;
                        const data = responses.docente;
                        this.setValuesForm(data);
                    }

                    if (responses.coordinadorFase1) {
                        this.isCoordinadorFase1Created = true;
                        const data = responses.coordinadorFase1;
                        data.conceptoCoordinador
                            ? this.sustentacionForm
                                  .get('conceptoCoordinador')
                                  .setValue('Aceptado')
                            : this.sustentacionForm
                                  .get('conceptoCoordinador')
                                  .setValue('Rechazado');
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

                        this.sustentacionForm
                            .get('fechaActa')
                            .setValue(actaDate ? new Date(actaDate) : null);

                        this.sustentacionForm
                            .get('numeroActa')
                            .setValue(actaNumber ? actaNumber : null);

                        this.sustentacionForm
                            .get('conceptoComite')
                            .setValue(
                                actaConceptoComite == 'APROBADO'
                                    ? 'Aprobado'
                                    : 'No Aprobado'
                            );
                    }

                    if (responses.coordinadorFase3) {
                        this.isCoordinadorFase3Created = true;
                        const data = responses.coordinadorFase3;
                        this.setValuesForm(data);
                        this.loadJuradoExterno();
                        this.loadJuradoInterno();
                        this.sustentacionForm
                            .get('juradosAceptados')
                            .setValue(
                                data?.juradosAceptados == 'ACEPTADO'
                                    ? 'Aceptado'
                                    : 'Rechazado'
                            );

                        this.sustentacionForm
                            .get('fechaActaConsejo')
                            .setValue(
                                data.fechaActaConsejo
                                    ? new Date(data.fechaActaConsejo)
                                    : null
                            );

                        this.sustentacionForm
                            .get('fechaSustentacion')
                            .setValue(
                                data.fechaSustentacion
                                    ? new Date(data.fechaSustentacion)
                                    : null
                            );
                    }

                    if (responses.estudiante) {
                        this.isEstudianteCreated = true;
                        const data = responses.estudiante;
                        this.setValuesForm(data);
                    }

                    if (responses.coordinadorFase4) {
                        this.isCoordinadorFase4Created = true;
                        const data = responses.coordinadorFase4;
                        this.setValuesForm(data);

                        let respuesta = '';
                        if (data.respuestaSustentacion == 'APROBADO') {
                            respuesta = 'Aprobado';
                        }
                        if (data.respuestaSustentacion == 'NO_APROBADO') {
                            respuesta = 'No Aprobado';
                        }
                        if (data.respuestaSustentacion == 'APLAZADO') {
                            respuesta = 'Aplazado';
                        }
                        this.sustentacionForm
                            .get('respuestaSustentacion')
                            .setValue(respuesta);

                        this.sustentacionForm
                            .get('fechaActaFinal')
                            .setValue(
                                data?.fechaActaFinal
                                    ? new Date(data.fechaActaFinal)
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
                        this.setup('linkFormatoF');
                        this.setup('anexos');
                        this.setup('linkMonografia');
                    }

                    if (
                        this.role.includes('ROLE_ESTUDIANTE') &&
                        this.isEstudianteCreated
                    ) {
                        this.setup('linkFormatoH');
                        this.setup('linkFormatoI');
                        this.setup('linkEstudioHojaVidaAcademicaGrado');
                    }

                    if (this.role.includes('ROLE_COORDINADOR')) {
                        if (this.isDocenteCreated) {
                            this.setup('linkFormatoF');
                            this.setup('linkMonografia');
                            this.setup('anexos');
                        }

                        if (this.isCoordinadorFase2Created) {
                            this.setup('linkFormatoG');
                            this.setup('linkEstudioHojaVidaAcademica');
                        }

                        if (this.isCoordinadorFase3Created) {
                            this.setup('linkOficioConsejo');
                        }

                        if (this.isEstudianteCreated) {
                            this.setup('linkFormatoH');
                            this.setup('linkFormatoI');
                            this.setup('linkEstudioHojaVidaAcademicaGrado');
                        }

                        if (this.isCoordinadorFase4Created) {
                            this.setup('linkActaSustentacionPublica');
                        }
                    }
                    this.isLoading = false;
                    resolve();
                },
            });
        });
    }

    async updateSustentacion() {
        this.isLoading = true;
        try {
            if (this.role.includes('ROLE_COORDINADOR')) {
                if (
                    this.estado ==
                        EstadoProceso.DEVUELTO_SUSTENTACION_PARA_CORREGIR_AL_DOCENTE_COORDINADOR ||
                    this.estado ==
                        EstadoProceso.DEVUELTO_SUSTENTACION_PARA_CORREGIR_AL_DOCENTE_COMITE
                ) {
                    this.isLoading = false;
                    return this.messageService.add(
                        errorMessage('No puedes modificar los datos.')
                    );
                }
            }

            if (this.role.includes('ROLE_DOCENTE')) {
                if (
                    this.isDocenteCreated &&
                    (this.estado ===
                        EstadoProceso.DEVUELTO_SUSTENTACION_PARA_CORREGIR_AL_DOCENTE_COORDINADOR ||
                        this.estado ===
                            EstadoProceso.DEVUELTO_SUSTENTACION_PARA_CORREGIR_AL_DOCENTE_COMITE)
                ) {
                    const b64FormatoF = await this.formatFileString(
                        this.FileFormatoF,
                        'linkFormatoF'
                    );

                    const b64FormatoMonografia = await this.formatFileString(
                        this.FileMonografia,
                        'linkMonografia'
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

                    const sustentacionData = {
                        ...this.sustentacionForm.value,
                        anexos: anexosBase64,
                        linkMonografia: `linkMonografia.pdf-${b64FormatoMonografia}`,
                        linkFormatoF: `linkFormatoF.pdf-${b64FormatoF}`,
                    };

                    await lastValueFrom(
                        this.sustentacionService.updateSustentacionDocente(
                            sustentacionData,
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
                    this.isCoordinadorFase1Created == false &&
                    this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE1_SUSTENTACION
                ) {
                    const sustentacionData =
                        this.sustentacionForm.get('conceptoCoordinador')
                            .value == 'Aceptado'
                            ? {
                                  conceptoCoordinador: 'ACEPTADO',
                              }
                            : {
                                  conceptoCoordinador: 'RECHAZADO',
                                  envioEmail: {
                                      asunto: this.sustentacionForm.get(
                                          'asuntoCoordinador'
                                      ).value,
                                      mensaje:
                                          this.sustentacionForm.get(
                                              'mensajeCoordinador'
                                          ).value,
                                  },
                              };

                    await lastValueFrom(
                        this.sustentacionService.createSustentacionCoordinadorFase1(
                            sustentacionData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isCoordinadorFase2Created == false &&
                    this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE2_SUSTENTACION
                ) {
                    const {
                        fechaActa,
                        numeroActa,
                        linkEstudioHojaVidaAcademica,
                        linkFormatoG,
                    } = this.sustentacionForm.value;

                    const b64Monografia = await this.formatFileString(
                        this.FileMonografia,
                        'linkMonografia'
                    );

                    const anexos = await this.formatFileString(
                        this.anexosFiles,
                        'anexos'
                    );

                    const b64FormatoG =
                        this.sustentacionForm.get('conceptoComite').value ==
                        'Aprobado'
                            ? await this.formatFileString(
                                  this.FileFormatoG,
                                  'linkFormatoG'
                              )
                            : '';

                    const b64Anexos = anexos.map(
                        (anexo: string, _: number) => anexo
                    );

                    const sustentacionData =
                        this.sustentacionForm.get('conceptoComite').value ==
                        'Aprobado'
                            ? {
                                  actaFechaRespuestaComite: [
                                      {
                                          fechaActa,
                                          numeroActa,
                                          conceptoComite: 'APROBADO',
                                      },
                                  ],
                                  envioEmail: {
                                      asunto: this.sustentacionForm.get(
                                          'asuntoComite'
                                      ).value,
                                      mensaje:
                                          this.sustentacionForm.get(
                                              'mensajeComite'
                                          ).value,
                                  },
                                  linkEstudioHojaVidaAcademica,
                                  linkFormatoG,
                                  informacionEnvioConsejo: {
                                      b64Monografia,
                                      b64Anexos,
                                      b64FormatoG,
                                  },
                              }
                            : {
                                  actaFechaRespuestaComite: [
                                      {
                                          fechaActa,
                                          numeroActa,
                                          conceptoComite: 'NO_APROBADO',
                                      },
                                  ],
                                  envioEmail: {
                                      asunto: this.sustentacionForm.get(
                                          'asuntoComite'
                                      ).value,
                                      mensaje:
                                          this.sustentacionForm.get(
                                              'mensajeComite'
                                          ).value,
                                  },
                              };

                    await lastValueFrom(
                        this.sustentacionService.createSustentacionCoordinadorFase2(
                            sustentacionData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isCoordinadorFase3Created == false &&
                    this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE3_SUSTENTACION
                ) {
                    const {
                        idJuradoInterno,
                        idJuradoExterno,
                        fechaSustentacion,
                        linkOficioConsejo,
                        fechaActaConsejo,
                        numeroActaConsejo,
                    } = this.sustentacionForm.value;

                    const sustentacionData =
                        this.sustentacionForm.get('juradosAceptados').value ==
                        'Aceptado'
                            ? {
                                  juradosAceptados: 'ACEPTADO',
                                  idJuradoInterno: 'Sin cambios',
                                  idJuradoExterno: 'Sin cambios',
                                  linkOficioConsejo,
                                  fechaActaConsejo,
                                  numeroActaConsejo,
                                  fechaSustentacion,
                              }
                            : {
                                  juradosAceptados: 'RECHAZADO',
                                  idJuradoInterno,
                                  idJuradoExterno,
                                  linkOficioConsejo,
                                  fechaActaConsejo,
                                  numeroActaConsejo,
                                  fechaSustentacion,
                              };

                    await lastValueFrom(
                        this.sustentacionService.createSustentacionCoordinadorFase3(
                            sustentacionData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isCoordinadorFase4Created == false &&
                    this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE4_SUSTENTACION
                ) {
                    const respuestaMap = {
                        Aprobado: 'APROBADO',
                        Aplazado: 'APLAZADO',
                        'No Aprobado': 'NO_APROBADO',
                    };

                    const { respuestaSustentacion, ...restFormValues } =
                        this.sustentacionForm.value;

                    const sustentacionData = {
                        respuestaSustentacion:
                            respuestaMap[respuestaSustentacion],
                        ...restFormValues,
                    };

                    await lastValueFrom(
                        this.sustentacionService.createSustentacionCoordinadorFase4(
                            sustentacionData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isCoordinadorFase1Created == true &&
                    this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE1_SUSTENTACION
                ) {
                    const sustentacionData =
                        this.sustentacionForm.get('conceptoCoordinador')
                            .value == 'Aceptado'
                            ? {
                                  conceptoCoordinador: 'ACEPTADO',
                              }
                            : {
                                  conceptoCoordinador: 'RECHAZADO',
                                  envioEmail: {
                                      asunto: this.sustentacionForm.get(
                                          'asuntoCoordinador'
                                      ).value,
                                      mensaje:
                                          this.sustentacionForm.get(
                                              'mensajeCoordinador'
                                          ).value,
                                  },
                              };

                    await lastValueFrom(
                        this.sustentacionService.updateSustentacionCoordinadorFase1(
                            sustentacionData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isCoordinadorFase2Created == true &&
                    this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE2_SUSTENTACION
                ) {
                    const {
                        fechaActa,
                        numeroActa,
                        linkEstudioHojaVidaAcademica,
                        linkFormatoG,
                    } = this.sustentacionForm.value;

                    const sustentacionData =
                        this.sustentacionForm.get('conceptoComite').value ==
                        'Aprobado'
                            ? {
                                  actaFechaRespuestaComite: [
                                      {
                                          fechaActa,
                                          numeroActa,
                                          conceptoComite: 'APROBADO',
                                      },
                                  ],
                                  envioEmail: {
                                      asunto: this.sustentacionForm.get(
                                          'asuntoComite'
                                      ).value,
                                      mensaje:
                                          this.sustentacionForm.get(
                                              'mensajeComite'
                                          ).value,
                                  },
                                  linkEstudioHojaVidaAcademica,
                                  linkFormatoG,
                              }
                            : {
                                  actaFechaRespuestaComite: [
                                      {
                                          fechaActa,
                                          numeroActa,
                                          conceptoComite: 'NO_APROBADO',
                                      },
                                  ],
                                  envioEmail: {
                                      asunto: this.sustentacionForm.get(
                                          'asuntoComite'
                                      ).value,
                                      mensaje:
                                          this.sustentacionForm.get(
                                              'mensajeComite'
                                          ).value,
                                  },
                              };

                    await lastValueFrom(
                        this.sustentacionService.updateSustentacionCoordinadorFase2(
                            sustentacionData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isCoordinadorFase3Created == true &&
                    (this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE3_SUSTENTACION ||
                        this.estado ==
                            EstadoProceso.SIN_ACTUALIZAR_FECHA_SUSTENTACION)
                ) {
                    const {
                        idJuradoInterno,
                        idJuradoExterno,
                        linkOficioConsejo,
                        fechaSustentacion,
                        numeroActaConsejo,
                        fechaActaConsejo,
                    } = this.sustentacionForm.value;

                    const sustentacionData =
                        this.sustentacionForm.get('juradosAceptados').value ==
                        'Aceptado'
                            ? {
                                  juradosAceptados: 'ACEPTADO',
                                  idJuradoInterno: this.juradoInterno.value,
                                  idJuradoExterno: this.juradoExterno.value,
                                  linkOficioConsejo,
                                  fechaSustentacion,
                                  numeroActaConsejo,
                                  fechaActaConsejo,
                              }
                            : {
                                  juradosAceptados: 'RECHAZADO',
                                  idJuradoInterno,
                                  idJuradoExterno,
                                  linkOficioConsejo,
                                  fechaSustentacion,
                                  numeroActaConsejo,
                                  fechaActaConsejo,
                              };

                    await lastValueFrom(
                        this.sustentacionService.updateSustentacionCoordinadorFase3(
                            sustentacionData,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (
                    this.isCoordinadorFase4Created == true &&
                    this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE4_SUSTENTACION
                ) {
                    const respuestaMap = {
                        Aprobado: 'APROBADO',
                        Aplazado: 'APLAZADO',
                        'No Aprobado': 'NO_APROBADO',
                    };

                    const { respuestaSustentacion, ...restFormValues } =
                        this.sustentacionForm.value;

                    const sustentacionData = {
                        respuestaSustentacion:
                            respuestaMap[respuestaSustentacion],
                        ...restFormValues,
                    };

                    await lastValueFrom(
                        this.sustentacionService.updateSustentacionCoordinadorFase4(
                            sustentacionData,
                            this.trabajoDeGradoId
                        )
                    );
                }
            }

            if (this.role.includes('ROLE_ESTUDIANTE')) {
                if (
                    this.isEstudianteCreated == false &&
                    this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_ESTUDIANTE_SUSTENTACION
                ) {
                    try {
                        const response = await firstValueFrom(
                            this.sustentacionService.verificarEgresado(
                                this.trabajoDeGradoId
                            )
                        );
                        if (response) {
                            await lastValueFrom(
                                this.sustentacionService.createSustentacionEstudiante(
                                    this.sustentacionForm.value,
                                    this.trabajoDeGradoId
                                )
                            );
                        } else {
                            this.isLoading = false;
                            return this.messageService.add(
                                warnMessage(
                                    'No es permitido registrar la información debido a que el estudiante no ha completado los datos de egresado.'
                                )
                            );
                        }
                    } catch (error) {
                        console.error('Error al crear la sustentación:', error);
                    }
                } else if (
                    this.isEstudianteCreated == true &&
                    this.estado ==
                        EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_ESTUDIANTE_SUSTENTACION
                ) {
                    await lastValueFrom(
                        this.sustentacionService.updateSustentacionEstudiante(
                            this.sustentacionForm.value,
                            this.trabajoDeGradoId
                        )
                    );
                } else if (this.isEstudianteCreated == true) {
                    this.isLoading = false;
                    return this.messageService.add(
                        errorMessage('No puedes modificar los datos.')
                    );
                }
            }

            if (
                (this.role.includes('ROLE_COORDINADOR') ||
                    this.role.includes('ROLE_DOCENTE') ||
                    this.role.includes('ROLE_ESTUDIANTE')) &&
                this.isCoordinadorFase4Created == true
            ) {
                this.isLoading = false;
                return this.messageService.add(
                    errorMessage('No puedes modificar los datos.')
                );
            }

            if (
                (this.role.includes('ROLE_COORDINADOR') ||
                    this.role.includes('ROLE_DOCENTE')) &&
                this.estado ==
                    EstadoProceso.PENDIENTE_SUBIDA_ARCHIVOS_ESTUDIANTE_SUSTENTACION
            ) {
                this.isLoading = false;
                return this.messageService.add(
                    errorMessage('No puedes modificar los datos.')
                );
            }
            this.isLoading = false;
            this.messageService.add(infoMessage(Mensaje.ACTUALIZACION_EXITOSA));
            this.router.navigate(['examen-de-valoracion']);
        } catch (error) {
            this.isLoading = false;
            this.messageService.add(
                errorMessage('Error al actualizar los datos en el backend')
            );
        }
    }

    async createSustentacion(): Promise<void> {
        this.isLoading = true;
        try {
            if (this.role.includes('ROLE_DOCENTE') && !this.isDocenteCreated) {
                const response = await firstValueFrom(
                    this.sustentacionService.createSustentacionDocente(
                        this.sustentacionForm.value,
                        this.trabajoDeGradoId
                    )
                );

                if (response) {
                    this.trabajoDeGradoService.setSustentacionSeleccionada(
                        response
                    );
                    this.messageService.add(
                        infoMessage(Mensaje.GUARDADO_EXITOSO)
                    );

                    await firstValueFrom(timer(2000));

                    this.isLoading = false;
                    this.router.navigate([`examen-de-valoracion`]);
                }
            }
        } catch (e) {
            this.handlerResponseException(e);
        }
    }

    createOrUpdateSustentacion() {
        if (this.sustentacionForm.invalid) {
            this.messageService.clear();
            this.messageService.add(
                warnMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS)
            );
            return;
        }

        this.router.url.includes('editar')
            ? this.updateSustentacion()
            : this.createSustentacion();
    }

    onFileSelectMonografia(event: any) {
        this.FileMonografia = this.uploadFileAndSetValue(
            'linkMonografia',
            event
        );
    }

    onFileSelectFormatoF(event: any) {
        this.FileFormatoF = this.uploadFileAndSetValue('linkFormatoF', event);
    }

    onFileSelectFormatoG(event: any) {
        this.FileFormatoG = this.uploadFileAndSetValue('linkFormatoG', event);
    }

    onFileSelectEstudioHVA(event: any) {
        this.FileEstudioHVA = this.uploadFileAndSetValue(
            'linkEstudioHojaVidaAcademica',
            event
        );
    }

    onFileSelectOficioConsejo(event: any) {
        this.FileOficioConsejo = this.uploadFileAndSetValue(
            'linkOficioConsejo',
            event
        );
    }

    onFileSelectFormatoH(event: any) {
        this.FileFormatoH = this.uploadFileAndSetValue('linkFormatoH', event);
    }

    onFileSelectFormatoI(event: any) {
        this.FileFormatoI = this.uploadFileAndSetValue('linkFormatoI', event);
    }

    onFileSelectActaSustentacionPublica(event: any) {
        this.FileActaSustentacionP = this.uploadFileAndSetValue(
            'linkActaSustentacionPublica',
            event
        );
    }

    onFileSelectEstudioHVAGrado(event: any) {
        this.FileEstudioHVAGrado = this.uploadFileAndSetValue(
            'linkEstudioHojaVidaAcademicaGrado',
            event
        );
    }

    onFileClear(field: string) {
        if (field == 'linkFormatoF') {
            this.FileFormatoF = null;
            this.FormatoF.clear();
            this.sustentacionForm.get('linkFormatoF').reset();
        }

        if (field == 'linkMonografia') {
            this.FileMonografia = null;
            this.Monografia.clear();
            this.sustentacionForm.get('linkMonografia').reset();
        }

        if (field == 'linkFormatoG') {
            this.FileFormatoG = null;
            this.FormatoG.clear();
            this.sustentacionForm.get('linkFormatoG').reset();
        }

        if (field == 'linkEstudioHojaVidaAcademica') {
            this.FileEstudioHVA = null;
            this.EstudioHVA.clear();
            this.sustentacionForm.get('linkEstudioHojaVidaAcademica').reset();
        }

        if (field == 'linkOficioConsejo') {
            this.FileOficioConsejo = null;
            this.OficioConsejo.clear();
            this.sustentacionForm.get('linkOficioConsejo').reset();
        }

        if (field == 'linkFormatoH') {
            this.FileFormatoH = null;
            this.FormatoH.clear();
            this.sustentacionForm.get('linkFormatoH').reset();
        }

        if (field == 'linkFormatoI') {
            this.FileFormatoI = null;
            this.FormatoI.clear();
            this.sustentacionForm.get('linkFormatoI').reset();
        }

        if (field == 'linkActaSustentacionPublica') {
            this.FileActaSustentacionP = null;
            this.ActaSustentacionP.clear();
            this.sustentacionForm.get('linkActaSustentacionPublica').reset();
        }

        if (field == 'linkEstudioHojaVidaAcademicaGrado') {
            this.FileEstudioHVAGrado = null;
            this.EstudioHVAGrado.clear();
            this.sustentacionForm
                .get('linkEstudioHojaVidaAcademicaGrado')
                .reset();
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
                    this.sustentacionForm
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

    async getFileAndSetValue(fieldName: string) {
        let errorShown = false;
        const handleError = () => {
            if (!errorShown) {
                this.messageService.add(
                    warnMessage('Modifica la información para ver los cambios.')
                );
                errorShown = true;
            }
        };

        try {
            if (fieldName === 'anexos') {
                const anexos = this.sustentacionForm.get(fieldName).value;
                for (const anexo of anexos) {
                    try {
                        const response = await firstValueFrom(
                            this.trabajoDeGradoService.getFile(anexo)
                        );
                        this.downloadFile(response, anexo, fieldName);
                    } catch (error) {
                        handleError();
                    }
                }
            } else {
                const rutaArchivo = this.sustentacionForm.get(fieldName).value;
                try {
                    const response = await firstValueFrom(
                        this.trabajoDeGradoService.getFile(rutaArchivo)
                    );
                    this.downloadFile(response, rutaArchivo, fieldName);
                } catch (error) {
                    handleError();
                }
            }
        } catch (error) {
            handleError();
        }
    }

    //#region Director and Coodirector
    showBuscadorJuradoInterno() {
        return this.dialogService.open(BuscadorDocentesComponent, {
            header: 'Seleccionar docente',
            width: '60%',
        });
    }

    showBuscadorJuradoExterno() {
        return this.dialogService.open(BuscadorExpertosComponent, {
            header: 'Seleccionar experto',
            width: '60%',
        });
    }

    mapJuradoInternoLabel(docente: any) {
        const ultimaUniversidad =
            docente?.titulos?.length > 0
                ? docente.titulos[docente.titulos.length - 1].universidad
                : null;

        return {
            id: docente.id,
            nombre: docente.nombre,
            apellido: docente.apellido,
            correo: docente.correoElectronico ?? docente.correo,
            universidad: docente.universidad ?? ultimaUniversidad,
        };
    }

    mapJuradoExternoLabel(experto: any) {
        return {
            id: experto.id,
            nombre: experto.nombre,
            apellido: experto.apellido,
            correo: experto.correoElectronico ?? experto.correo,
            universidad: experto.universidad,
        };
    }

    async onSeleccionarJuradoInterno() {
        try {
            const ref = this.showBuscadorJuradoInterno();
            const response = await firstValueFrom(ref.onClose);

            if (response) {
                const juradoInterno = this.mapJuradoInternoLabel(response);
                this.juradoInternoSeleccionado = juradoInterno;
                this.juradoInterno.setValue(juradoInterno.id);
            }
        } catch (error) {
            console.error('Error al seleccionar jurado interno', error);
        }
    }

    async onSeleccionarJuradoExterno() {
        try {
            const ref = this.showBuscadorJuradoExterno();
            const response = await firstValueFrom(ref.onClose);

            if (response) {
                const juradoExterno = this.mapJuradoExternoLabel(response);
                this.juradoExternoSeleccionado = juradoExterno;
                this.juradoExterno.setValue(juradoExterno.id);
            }
        } catch (error) {
            console.error('Error al seleccionar jurado externo', error);
        }
    }

    limpiarJuradoExterno() {
        this.juradoExterno.setValue(null);
        // this.juradoExternoSeleccionado = null;
    }

    limpiarJuradoInterno() {
        this.juradoInterno.setValue(null);
        // this.juradoInternoSeleccionado = null;
    }
    //#endregion

    redirectToSolicitud(trabajoDeGradoId: number) {
        this.router.navigate([
            `examen-de-valoracion/solicitud/editar/${trabajoDeGradoId}`,
        ]);
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

    redirectToBandeja() {
        this.router.navigate(['examen-de-valoracion']);
    }

    handlerResponseException(response: any) {
        if (response.status != 500) return;
        const mapException = mapResponseException(response.error);
        mapException.forEach((value, _) => {
            this.messageService.add(errorMessage(value));
        });
    }

    isActiveIndex(): Boolean {
        if (this.router.url.includes('sustentacion')) {
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
            this.isCoordinadorFase2Created &&
            this.isCoordinadorFase3Created &&
            this.isEstudianteCreated &&
            this.isCoordinadorFase4Created
        ) {
            return 'Modificar Informacion';
        } else {
            return 'Guardar';
        }
    }
}
