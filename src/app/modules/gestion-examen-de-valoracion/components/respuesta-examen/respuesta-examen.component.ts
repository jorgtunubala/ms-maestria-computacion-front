import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subscription, catchError, of } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Docente } from 'src/app/modules/gestion-docentes/models/docente';
import { Estudiante } from 'src/app/modules/gestion-estudiantes/models/estudiante';
import { Aviso, EstadoProceso, Mensaje } from 'src/app/core/enums/enums';
import {
    errorMessage,
    infoMessage,
    warnMessage,
} from 'src/app/core/utils/message-util';
import { RespuestaService } from '../../services/respuesta.service';
import { Experto } from '../../models/experto';
import { mapResponseException } from 'src/app/core/utils/exception-util';
import { ResolucionService } from '../../services/resolucion.service';
import { TrabajoDeGradoService } from '../../services/trabajoDeGrado.service';
import { AutenticacionService } from 'src/app/modules/gestion-autenticacion/services/autenticacion.service';

@Component({
    selector: 'app-respuesta-examen',
    templateUrl: './respuesta-examen.component.html',
    styleUrls: ['./respuesta-examen.component.scss'],
})
export class RespuestaExamenComponent implements OnInit {
    @Output() formReady = new EventEmitter<FormGroup>();

    private estudianteSubscription: Subscription;
    private tituloSubscription: Subscription;
    private trabajoSeleccionadoSubscription: Subscription;
    private resolucionValidSubscription: Subscription;
    private resolucionSubscription: Subscription;
    private respuestaValidSubscription: Subscription;
    private sustentacionSubscription: Subscription;
    private evaluadorInternoSubscription: Subscription;
    private evaluadorExternoSubscription: Subscription;

    editMode: boolean = false;
    isLoading: boolean;
    isRespuestaValid: boolean = false;
    isResolucionValid: boolean = false;

    role: string[];
    estado: string;

    trabajoDeGradoId: number;
    solicitudId: number;
    respuestaId: number;
    resolucionId: number;
    sustentacionId: number;

    respuestaForm: FormGroup;

    selectedFiles: { [key: string]: any } = {};
    anexosFiles: File[] = [];
    anexosBase64: { linkAnexo: string }[] = [];
    evaluacionDocenteIds: number[] = [];
    evaluacionExpertoIds: number[] = [];

    tituloSeleccionado: string;
    estudianteSeleccionado: Estudiante = {};
    expertoSeleccionado: Experto;
    docenteSeleccionado: Docente;

    estados: string[] = ['APROBADO', 'APLAZADO', 'NO_APROBADO'];

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private trabajoDeGradoService: TrabajoDeGradoService,
        private messageService: MessageService,
        private respuestaService: RespuestaService,
        private resolucionService: ResolucionService,
        private autenticacion: AutenticacionService
    ) {}

    get expertoEvaluaciones(): FormArray {
        return this.respuestaForm.get('expertoEvaluaciones') as FormArray;
    }

    get docenteEvaluaciones(): FormArray {
        return this.respuestaForm.get('docenteEvaluaciones') as FormArray;
    }

    ngOnInit() {
        this.initializeComponent();
    }

    async initializeComponent() {
        this.role = this.autenticacion.getRole();
        this.initForm();
        await this.subscribeToObservers();
        this.checkEstados();
        this.loadRespuestas();
    }

    subscribeToObservers(): Promise<void[]> {
        return Promise.all([
            new Promise<void>((resolve, reject) => {
                this.estudianteSubscription =
                    this.trabajoDeGradoService.estudianteSeleccionado$.subscribe(
                        {
                            next: (response) => {
                                if (response) {
                                    this.estudianteSeleccionado = response;
                                    resolve();
                                } else {
                                    this.router.navigate([
                                        'examen-de-valoracion',
                                    ]);
                                    reject();
                                }
                            },
                            error: (e) => {
                                this.handlerResponseException(e);
                            },
                        }
                    );
            }),
            new Promise<void>((resolve, reject) => {
                this.tituloSubscription =
                    this.trabajoDeGradoService.tituloSeleccionadoSubject$.subscribe(
                        {
                            next: (response) => {
                                if (response) {
                                    this.tituloSeleccionado = response;
                                }
                                resolve();
                            },
                            error: (e) => {
                                this.handlerResponseException(e);
                            },
                        }
                    );
            }),
            new Promise<void>((resolve, reject) => {
                this.trabajoSeleccionadoSubscription =
                    this.trabajoDeGradoService.trabajoSeleccionadoSubject$.subscribe(
                        {
                            next: (response) => {
                                if (response) {
                                    this.estado = response.estado;
                                    this.trabajoDeGradoId = response.id;

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
                                    resolve();

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
                                                                (
                                                                    evaluador: any
                                                                ) =>
                                                                    evaluador.respuestaExamenValoracion ===
                                                                    'APROBADO'
                                                            );

                                                        const evaluadorInternoAprobado =
                                                            response.evaluador_interno.find(
                                                                (
                                                                    evaluador: any
                                                                ) =>
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
                                }
                            },
                            error: (e) => {
                                this.handlerResponseException(e);
                            },
                        }
                    );
            }),
            new Promise<void>((resolve, reject) => {
                this.resolucionSubscription =
                    this.trabajoDeGradoService.resolucionSeleccionadaSubject$.subscribe(
                        {
                            next: (response) => {
                                if (response) {
                                    this.resolucionId = response.id;
                                }
                                resolve();
                            },
                            error: (e) => {
                                this.handlerResponseException(e);
                            },
                        }
                    );
            }),
            new Promise<void>((resolve, reject) => {
                this.sustentacionSubscription =
                    this.trabajoDeGradoService.sustentacionSeleccionadaSubject$.subscribe(
                        {
                            next: (response) => {
                                if (response) {
                                    this.sustentacionId = response.id;
                                }
                                resolve();
                            },
                            error: (e) => {
                                this.handlerResponseException(e);
                            },
                        }
                    );
            }),
            new Promise<void>((resolve, reject) => {
                this.evaluadorExternoSubscription =
                    this.trabajoDeGradoService.evaluadorExternoSeleccionadoSubject$.subscribe(
                        {
                            next: (response) => {
                                if (response) {
                                    this.expertoSeleccionado = response;
                                }
                                resolve();
                            },
                            error: (e) => {
                                this.handlerResponseException(e);
                            },
                        }
                    );
            }),
            new Promise<void>((resolve, reject) => {
                this.evaluadorInternoSubscription =
                    this.trabajoDeGradoService.evaluadorInternoSeleccionadoSubject$.subscribe(
                        {
                            next: (response) => {
                                if (response) {
                                    this.docenteSeleccionado = response;
                                }
                                resolve();
                            },
                            error: (e) => {
                                this.handlerResponseException(e);
                            },
                        }
                    );
            }),
        ]);
    }

    setup(fieldName: string, formGroup: string) {
        const agregarArchivo = (file: File, key: string) => {
            if (!Array.isArray(this.selectedFiles[key])) {
                this.selectedFiles[key] = [];
            }
            const archivosExistentes = this.selectedFiles[key] as File[];
            archivosExistentes.push(file);
        };

        if (
            this.evaluacionExpertoIds?.length > 0 &&
            formGroup == 'expertoEvaluaciones'
        ) {
            this.evaluacionExpertoIds.forEach((_: number, index: number) => {
                if (fieldName == 'anexos') {
                    const fileString = this.expertoEvaluaciones
                        ?.at(index)
                        ?.get(`${fieldName}${index}`).value;
                    for (let anexo of fileString) {
                        this.trabajoDeGradoService
                            .getFile(anexo.linkAnexo)
                            .subscribe({
                                next: (response: any) => {
                                    if (response) {
                                        const byteCharacters = atob(response);
                                        const byteNumbers = new Array(
                                            byteCharacters.length
                                        );
                                        for (
                                            let i = 0;
                                            i < byteCharacters.length;
                                            i++
                                        ) {
                                            byteNumbers[i] =
                                                byteCharacters.charCodeAt(i);
                                        }
                                        const byteArray = new Uint8Array(
                                            byteNumbers
                                        );
                                        const file = new File(
                                            [byteArray],
                                            fieldName,
                                            { type: response.type }
                                        );

                                        agregarArchivo(
                                            file,
                                            `expertoEvaluaciones.${
                                                fieldName + index
                                            }`
                                        );
                                    }
                                },
                                error: (e) => this.handlerResponseException(e),
                            });
                    }
                } else {
                    const fileString = this.expertoEvaluaciones
                        ?.at(index)
                        ?.get(`${fieldName}${index}`).value;
                    this.trabajoDeGradoService.getFile(fileString).subscribe({
                        next: (response: any) => {
                            if (response) {
                                const byteCharacters = atob(response);
                                const byteNumbers = new Array(
                                    byteCharacters.length
                                );
                                for (
                                    let i = 0;
                                    i < byteCharacters.length;
                                    i++
                                ) {
                                    byteNumbers[i] =
                                        byteCharacters.charCodeAt(i);
                                }
                                const byteArray = new Uint8Array(byteNumbers);
                                const file = new File([byteArray], fieldName, {
                                    type: response.type,
                                });

                                this.selectedFiles[
                                    `expertoEvaluaciones.${fieldName + index}`
                                ] = file;
                            }
                        },
                        error: (e) => this.handlerResponseException(e),
                    });
                }
            });
        }

        if (
            this.evaluacionDocenteIds?.length > 0 &&
            formGroup == 'docenteEvaluaciones'
        ) {
            this.evaluacionDocenteIds.forEach((_: number, index: number) => {
                if (fieldName == 'anexos') {
                    const fileString = this.docenteEvaluaciones
                        ?.at(index)
                        ?.get(`${fieldName}${index}`).value;
                    for (let anexo of fileString) {
                        this.trabajoDeGradoService
                            .getFile(anexo.linkAnexo)
                            .subscribe({
                                next: (response: any) => {
                                    if (response) {
                                        const byteCharacters = atob(response);
                                        const byteNumbers = new Array(
                                            byteCharacters.length
                                        );
                                        for (
                                            let i = 0;
                                            i < byteCharacters.length;
                                            i++
                                        ) {
                                            byteNumbers[i] =
                                                byteCharacters.charCodeAt(i);
                                        }
                                        const byteArray = new Uint8Array(
                                            byteNumbers
                                        );
                                        const file = new File(
                                            [byteArray],
                                            fieldName,
                                            { type: response.type }
                                        );

                                        agregarArchivo(
                                            file,
                                            `docenteEvaluaciones.${
                                                fieldName + index
                                            }`
                                        );
                                    }
                                },
                                error: (e) => this.handlerResponseException(e),
                            });
                    }
                } else {
                    const fileString = this.docenteEvaluaciones
                        ?.at(index)
                        ?.get(`${fieldName}${index}`).value;
                    this.trabajoDeGradoService.getFile(fileString).subscribe({
                        next: (response: any) => {
                            if (response) {
                                const byteCharacters = atob(response);
                                const byteNumbers = new Array(
                                    byteCharacters.length
                                );
                                for (
                                    let i = 0;
                                    i < byteCharacters.length;
                                    i++
                                ) {
                                    byteNumbers[i] =
                                        byteCharacters.charCodeAt(i);
                                }
                                const byteArray = new Uint8Array(byteNumbers);
                                const file = new File([byteArray], fieldName, {
                                    type: response.type,
                                });

                                this.selectedFiles[
                                    `docenteEvaluaciones.${fieldName + index}`
                                ] = file;
                            }
                        },
                        error: (e) => this.handlerResponseException(e),
                    });
                }
            });
        }
    }

    initForm(): void {
        this.respuestaForm = this.fb.group({
            expertoEvaluaciones: this.fb.array([]),
            docenteEvaluaciones: this.fb.array([]),
            estadoFinalizado: [false, Validators.required],
            observacion: [null],
        });

        this.formReady.emit(this.respuestaForm);
    }

    checkEstados() {
        switch (this.estado) {
            case EstadoProceso.PENDIENTE_RESULTADO_EXAMEN_DE_VALORACION:
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: EstadoProceso.PENDIENTE_RESULTADO_EXAMEN_DE_VALORACION,
                });
                break;
            case EstadoProceso.EXAMEN_DE_VALORACION_CANCELADO:
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: EstadoProceso.EXAMEN_DE_VALORACION_CANCELADO,
                });
                this.router.navigate(['examen-de-valoracion']);
                break;
            case EstadoProceso.EXAMEN_DE_VALORACION_APROBADO_EVALUADOR_1:
                this.messageService.add({
                    severity: 'info',
                    summary: 'Informacion',
                    detail: EstadoProceso.EXAMEN_DE_VALORACION_APROBADO_EVALUADOR_1,
                });
                break;
            case EstadoProceso.EXAMEN_DE_VALORACION_APROBADO_EVALUADOR_2:
                this.messageService.add({
                    severity: 'info',
                    summary: 'Informacion',
                    detail: EstadoProceso.EXAMEN_DE_VALORACION_APROBADO_EVALUADOR_2,
                });
                break;
            default:
                break;
        }
    }

    loadRespuestas() {
        this.isLoading = true;
        this.evaluacionExpertoIds = [];
        this.evaluacionDocenteIds = [];
        this.selectedFiles = {};

        this.respuestaService
            .getRespuestasExamen(this.trabajoDeGradoId)
            .pipe(
                catchError((error) => {
                    this.handlerResponseException(error);
                    this.isLoading = false;
                    return of(null);
                })
            )
            .subscribe({
                next: (response) => {
                    this.initializeFormFromResponse(response);
                    this.isLoading = false;
                },
            });
    }

    ngOnDestroy() {
        if (this.estudianteSubscription) {
            this.estudianteSubscription.unsubscribe();
        }
        if (this.tituloSubscription) {
            this.tituloSubscription.unsubscribe();
        }
        if (this.trabajoSeleccionadoSubscription) {
            this.trabajoSeleccionadoSubscription.unsubscribe();
        }
        if (this.resolucionSubscription) {
            this.resolucionSubscription.unsubscribe();
        }
        if (this.resolucionValidSubscription) {
            this.resolucionSubscription.unsubscribe();
        }
        if (this.respuestaValidSubscription) {
            this.resolucionSubscription.unsubscribe();
        }
        if (this.sustentacionSubscription) {
            this.sustentacionSubscription.unsubscribe();
        }
        if (this.evaluadorExternoSubscription) {
            this.evaluadorExternoSubscription.unsubscribe();
        }
        if (this.evaluadorInternoSubscription) {
            this.evaluadorInternoSubscription.unsubscribe();
        }
    }

    initializeForm(respuestas: any) {
        let indexExperto = 0;
        let indexDocente = 0;

        respuestas?.evaluador_externo?.forEach((respuesta) => {
            if (respuesta.tipoEvaluador == 'EXTERNO') {
                this.evaluacionExpertoIds.push(respuesta.id);
                this.respuestaForm.patchValue({
                    observacion: respuesta.observacion,
                });
                this.respuestaForm.patchValue({
                    estadoFinalizado: respuesta.estadoFinalizado,
                });

                const evaluacionFormGroup = this.fb.group({
                    ['id']: [respuesta.id, Validators.required],
                    ['linkFormatoB' + indexExperto]: [
                        respuesta.linkFormatoB,
                        Validators.required,
                    ],
                    ['linkFormatoC' + indexExperto]: [
                        respuesta.linkFormatoC,
                        Validators.required,
                    ],
                    ['linkObservaciones' + indexExperto]: [
                        respuesta.linkObservaciones,
                        Validators.required,
                    ],
                    ['anexos' + indexExperto]: [
                        respuesta.anexos,
                        Validators.required,
                    ],
                    ['idEvaluador' + indexExperto]: [respuesta.idEvaluador],
                    ['tipoEvaluador' + indexExperto]: [respuesta.tipoEvaluador],
                    ['respuestaExamenValoracionExperto' + indexExperto]: [
                        respuesta.respuestaExamenValoracion,
                        Validators.required,
                    ],
                    ['fechaMaximaEntrega' + indexExperto]: [
                        respuesta.fechaMaximaEntrega,
                    ],
                    ['asunto' + indexExperto]: [
                        'Respuesta Examen de Valoracion',
                        Validators.required,
                    ],
                    ['mensaje' + indexExperto]: [
                        'Documentos enviados por',
                        Validators.required,
                    ],
                });
                this.expertoEvaluaciones.push(evaluacionFormGroup);
                this.expertoEvaluaciones.at(indexExperto).patchValue({
                    ['fechaMaximaEntrega' + indexExperto]:
                        respuesta?.fechaMaximaEntrega
                            ? new Date(respuesta.fechaMaximaEntrega)
                            : null,
                });
                this.setup('linkFormatoB', 'expertoEvaluaciones');
                this.setup('linkFormatoC', 'expertoEvaluaciones');
                this.setup('linkObservaciones', 'expertoEvaluaciones');
                this.setup('anexos', 'expertoEvaluaciones');
                indexExperto++;
            }
        });

        respuestas?.evaluador_interno?.forEach((respuesta) => {
            if (respuesta.tipoEvaluador == 'INTERNO') {
                this.evaluacionDocenteIds.push(respuesta.id);
                this.respuestaForm.patchValue({
                    observacion: respuesta.observacion,
                });
                this.respuestaForm.patchValue({
                    estadoFinalizado: respuesta.estadoFinalizado,
                });
                const evaluacionFormGroup = this.fb.group({
                    ['id']: [respuesta.id, Validators.required],
                    ['linkFormatoB' + indexDocente]: [
                        respuesta.linkFormatoB,
                        Validators.required,
                    ],
                    ['linkFormatoC' + indexDocente]: [
                        respuesta.linkFormatoC,
                        Validators.required,
                    ],
                    ['linkObservaciones' + indexDocente]: [
                        respuesta.linkObservaciones,
                        Validators.required,
                    ],
                    ['anexos' + indexDocente]: [
                        respuesta.anexos,
                        Validators.required,
                    ],
                    ['idEvaluador' + indexDocente]: [respuesta.idEvaluador],
                    ['tipoEvaluador' + indexDocente]: [respuesta.tipoEvaluador],
                    ['respuestaExamenValoracionDocente' + indexDocente]: [
                        respuesta.respuestaExamenValoracion,
                        Validators.required,
                    ],
                    ['fechaMaximaEntrega' + indexDocente]: [
                        respuesta.fechaMaximaEntrega,
                    ],
                    ['asunto' + indexDocente]: [
                        'Respuesta Examen de Valoracion',
                        Validators.required,
                    ],
                    ['mensaje' + indexDocente]: [
                        'Documentos enviados por',
                        Validators.required,
                    ],
                });
                this.docenteEvaluaciones.push(evaluacionFormGroup);
                this.docenteEvaluaciones.at(indexDocente).patchValue({
                    ['fechaMaximaEntrega' + indexDocente]:
                        respuesta?.fechaMaximaEntrega
                            ? new Date(respuesta.fechaMaximaEntrega)
                            : null,
                });
                this.setup('linkFormatoB', 'docenteEvaluaciones');
                this.setup('linkFormatoC', 'docenteEvaluaciones');
                this.setup('linkObservaciones', 'docenteEvaluaciones');
                this.setup('anexos', 'docenteEvaluaciones');
                indexDocente++;
            }
        });
    }

    initializeFormFromResponse(response: any[]) {
        this.expertoEvaluaciones.clear();
        this.docenteEvaluaciones.clear();
        this.initializeForm(response);
    }

    async onUpload(event: any, formArrayName: string, index: number) {
        const maxFileSize = 5000000;
        const filesToProcess = [
            ...(this.selectedFiles[`${formArrayName}.anexos${index}`] || []),
            ...event.files,
        ];

        try {
            const conversionResults = await Promise.all(
                filesToProcess.map(async (file) => {
                    if (file.size > maxFileSize) {
                        throw new Error('Archivo demasiado grande');
                    }

                    const base64 = await this.convertFileToBase64(file);
                    const fileType = file.type.split('/')[1];
                    return {
                        linkAnexo: `Anexos${uuidv4()
                            .replace(/-/g, '')
                            .slice(0, 4)}.${fileType}-${base64}`,
                    };
                })
            );

            this.anexosBase64 = conversionResults;
            this.selectedFiles[`${formArrayName}.anexos${index}`] =
                filesToProcess;
            this[formArrayName]
                .at(index)
                .get(`anexos${index}`)
                .setValue(this.anexosBase64);
        } catch (error) {
            console.error('Error al procesar archivos:', error);
            this.messageService.add(
                errorMessage(Aviso.ARCHIVO_DEMASIADO_GRANDE)
            );
        }
    }

    removeFile(formArrayName: string, indexFiles: number, indexAnexos: number) {
        const anexosKey = `${formArrayName}.anexos${indexAnexos}`;
        const anexos = this.selectedFiles[anexosKey];

        if (Array.isArray(anexos)) {
            anexos.splice(indexFiles, 1);
        }

        const anexosField = this[formArrayName]
            .at(indexAnexos)
            .get('anexos' + indexAnexos);
        if (anexosField) {
            let currentAnexos = anexosField.value;
            if (Array.isArray(currentAnexos)) {
                currentAnexos.splice(indexFiles, 1);
                anexosField.setValue(currentAnexos);
            }
        }
    }
    //#endregion

    isExamenCreado(formArrayName: string, index: number): boolean {
        let evaluacion: any;
        if (formArrayName == 'expertoEvaluaciones') {
            evaluacion = this[formArrayName].at(index);
            return this.evaluacionExpertoIds.includes(evaluacion?.value.id);
        }
        if (formArrayName == 'docenteEvaluaciones') {
            evaluacion = this[formArrayName].at(index);
            return this.evaluacionDocenteIds.includes(evaluacion?.value.id);
        }
        return false;
    }

    showObservacion(): boolean {
        if (this.docenteEvaluaciones.length > 0) {
            const index = this.docenteEvaluaciones.length - 1;
            const docenteValue = this.docenteEvaluaciones
                .at(index)
                .get('respuestaExamenValoracionDocente' + index)?.value;
            return ['APLAZADO', 'NO_APROBADO'].includes(docenteValue);
        }
        if (this.expertoEvaluaciones.length > 0) {
            const index = this.expertoEvaluaciones.length - 1;
            const expertoValue = this.expertoEvaluaciones
                .at(index)
                .get('respuestaExamenValoracionExperto' + index)?.value;
            return ['APLAZADO', 'NO_APROBADO'].includes(expertoValue);
        }
        return false;
    }

    mapEvaluacion(formArrayName: string, index: number) {
        const evaluacion = this[formArrayName].at(index).value;
        const i = index;

        return {
            linkFormatoB: evaluacion['linkFormatoB' + i],
            linkFormatoC: evaluacion['linkFormatoC' + i],
            linkObservaciones: evaluacion['linkObservaciones' + i],
            anexos: evaluacion['anexos' + i],
            tipoEvaluador: evaluacion['tipoEvaluador' + i],
            idEvaluador: evaluacion['idEvaluador' + i],
            respuestaExamenValoracion:
                formArrayName === 'expertoEvaluaciones'
                    ? evaluacion['respuestaExamenValoracionExperto' + i]
                    : evaluacion['respuestaExamenValoracionDocente' + i],
            fechaMaximaEntrega: evaluacion['fechaMaximaEntrega' + i],
            asunto: evaluacion['asunto' + i],
            mensaje: evaluacion['mensaje' + i],
        };
    }

    async updateRespuestaExamen(formArrayName: string, index: number) {
        if (this[formArrayName].at(index).invalid) {
            this.messageService.clear();
            this.messageService.add(
                warnMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS)
            );
            return;
        }
        this.isLoading = true;
        const respuestaId =
            formArrayName === 'expertoEvaluaciones'
                ? this.evaluacionExpertoIds[index]
                : this.evaluacionDocenteIds[index];

        const evaluacionData = this.mapEvaluacion(formArrayName, index);

        const {
            expertoEvaluaciones: omitExperto,
            docenteEvaluaciones: omitDocente,
            ...restFormValues
        } = this.respuestaForm.value;
        const { asunto, mensaje, ...restEvaluacionData } = evaluacionData;

        const respuestaMail = {
            envioEmail: {
                asunto,
                mensaje,
            },
        };

        const respuestaData = {
            ...restFormValues,
            ...restEvaluacionData,
            ...respuestaMail,
            estadoFinalizado: Number(restFormValues.estadoFinalizado),
        };

        const formatoB = await this.formatFileString(
            this.selectedFiles[`${formArrayName}.linkFormatoB${index}`],
            'linkFormatoB'
        );

        const formatoC = await this.formatFileString(
            this.selectedFiles[`${formArrayName}.linkFormatoC${index}`],
            'linkFormatoC'
        );

        respuestaData.linkFormatoB = formatoB;
        respuestaData.linkFormatoC = formatoC;
        if (respuestaData.respuestaExamenValoracion == 'APROBADO')
            respuestaData.fechaMaximaEntrega = '';

        this.respuestaService
            .updateRespuestaExamen(respuestaId, respuestaData)
            .subscribe({
                next: (response) => {
                    if (response) {
                        this.trabajoDeGradoService.setRespuestaSeleccionada(
                            response
                        );
                        this[formArrayName]
                            .at(this[formArrayName].length - 1)
                            .patchValue({
                                id: response.id,
                            });
                    }
                },
                error: (e) => {
                    this.handlerResponseException(e);
                    this.isLoading = false;
                },
                complete: () => {
                    this.isLoading = false;
                    this.messageService.add(
                        infoMessage(Aviso.RESPUESTA_ACTUALIZADA_CORRECTAMENTE)
                    );
                    this.router.navigate(['examen-de-valoracion']);
                },
            });
    }

    async formatFileString(file: any, fileControlName: string): Promise<any> {
        try {
            const base64 = await this.convertFileToBase64(file);
            return `${fileControlName}.pdf-${base64}`;
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

    async createRespuestaExamen(formArrayName: string, index: number) {
        if (this[formArrayName].at(index).invalid) {
            this.messageService.clear();
            this.messageService.add(
                warnMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS)
            );
            return;
        }
        this.isLoading = true;

        const evaluacionData = this.mapEvaluacion(formArrayName, index);

        const {
            expertoEvaluaciones: omitExperto,
            docenteEvaluaciones: omitDocente,
            ...restFormValues
        } = this.respuestaForm.value;
        const { asunto, mensaje, ...restEvaluacionData } = evaluacionData;

        const respuestaMail = {
            envioEmail: {
                asunto,
                mensaje,
            },
        };

        const respuestaData = {
            ...restFormValues,
            ...restEvaluacionData,
            ...respuestaMail,
            estadoFinalizado: Number(restFormValues.estadoFinalizado),
        };

        this.respuestaService
            .createRespuestaExamen(respuestaData, this.trabajoDeGradoId)
            .subscribe({
                next: (response) => {
                    if (response) {
                        this.trabajoDeGradoService.setRespuestaSeleccionada(
                            response
                        );
                        this[formArrayName]
                            .at(this[formArrayName].length - 1)
                            .patchValue({
                                id: response.id,
                            });
                    }
                },
                error: (e) => {
                    this.handlerResponseException(e);
                    this.isLoading = false;
                },
                complete: () => {
                    this.isLoading = false;
                    this.messageService.add(
                        infoMessage(Aviso.RESPUESTA_GUARDADA_CORRECTAMENTE)
                    );
                    this.router.navigate(['examen-de-valoracion']);
                },
            });
    }

    agregarEvaluacion(formArrayName: string) {
        if (this[formArrayName].invalid) {
            this.messageService.add(
                warnMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS)
            );
        } else {
            const evaluacionId = uuidv4();
            const evaluacion = this.fb.group({
                ['id']: [evaluacionId, Validators.required],
                ['linkFormatoB' + this[formArrayName].length]: [
                    null,
                    Validators.required,
                ],
                ['linkFormatoC' + this[formArrayName].length]: [
                    null,
                    Validators.required,
                ],
                ['linkObservaciones' + this[formArrayName].length]: [
                    null,
                    Validators.required,
                ],
                ['anexos' + this[formArrayName].length]: [
                    null,
                    Validators.required,
                ],
                ['tipoEvaluador' + this[formArrayName].length]: [
                    formArrayName === 'expertoEvaluaciones'
                        ? 'EXTERNO'
                        : 'INTERNO',
                    Validators.required,
                ],
                ['idEvaluador' + this[formArrayName].length]: [
                    formArrayName === 'expertoEvaluaciones'
                        ? this.expertoSeleccionado.id
                        : this.docenteSeleccionado.id,
                    Validators.required,
                ],
                [formArrayName === 'expertoEvaluaciones'
                    ? 'respuestaExamenValoracionExperto' +
                      this[formArrayName].length
                    : 'respuestaExamenValoracionDocente' +
                      this[formArrayName].length]: [null, Validators.required],
                ['fechaMaximaEntrega' + this[formArrayName].length]: [null],
                ['asunto' + this[formArrayName].length]: [
                    'Respuesta Examen de Valoracion',
                    Validators.required,
                ],
                ['mensaje' + this[formArrayName].length]: [
                    'Documentos enviados por',
                    Validators.required,
                ],
            });
            this[formArrayName].push(evaluacion);
        }
    }

    updateControlNames(formArray: FormArray) {
        formArray.controls.forEach((control, index) => {
            const newControls = {};
            Object.keys(control.value).forEach((key) => {
                const newName = key.replace(/\d+$/, index.toString());
                newControls[newName] = control.get(key);
            });
            formArray.setControl(index, this.fb.group(newControls));
        });
    }

    eliminarRespuestaExamen(formArrayName: string, index: number) {
        this[formArrayName].removeAt(index);
        this.updateControlNames(this[formArrayName]);
        this.loadRespuestas();
    }

    onRemove(arr: any) {
        this.selectedFiles[`${arr[1]}.${arr[0]}`] = null;
    }

    onArchivoSeleccionado(arr: any): void {
        this.selectedFiles[`${arr[2]}.${arr[0]}`] = arr[1];
        if (arr[2] == 'expertoEvaluaciones') {
            let index = arr[0].charAt(arr[0].length - 1);
            this.expertoEvaluaciones.at(index).get(arr[0]).setValue(arr[3]);
        }
        if (arr[2] == 'docenteEvaluaciones') {
            let index = arr[0].charAt(arr[0].length - 1);
            this.docenteEvaluaciones.at(index).get(arr[0]).setValue(arr[3]);
        }
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

    getFileAndSetValue(formArrayName: string, filename: string, index: number) {
        let errorShown = false;

        const handleError = () => {
            if (!errorShown) {
                this.messageService.add(
                    warnMessage('Modifica la información para ver los cambios.')
                );
                errorShown = true;
            }
        };

        if (filename === 'anexos') {
            for (const anexo of this[formArrayName]
                .at(index)
                .get(`${filename}${index}`).value) {
                this.trabajoDeGradoService.getFile(anexo.linkAnexo).subscribe({
                    next: (response: string) =>
                        this.downloadFile(response, anexo.linkAnexo, filename),
                    error: handleError,
                });
            }
        } else {
            const rutaArchivo = this[formArrayName]
                .at(index)
                .get(`${filename}${index}`).value;
            this.trabajoDeGradoService.getFile(rutaArchivo).subscribe({
                next: (response: string) =>
                    this.downloadFile(response, rutaArchivo, filename),
                error: handleError,
            });
        }
    }

    redirectToSolicitud(trabajoDeGradoId: number) {
        this.router.navigate([
            `examen-de-valoracion/solicitud/editar/${trabajoDeGradoId}`,
        ]);
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
        if (response.status != 500) return;
        const mapException = mapResponseException(response.error);
        mapException.forEach((value, _) => {
            this.messageService.add(errorMessage(value));
        });
    }

    isActiveIndex(): Boolean {
        if (this.router.url.includes('respuesta')) {
            return true;
        }
        return false;
    }
}
