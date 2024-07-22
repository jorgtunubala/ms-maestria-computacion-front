import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import {
    Component,
    ElementRef,
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
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { Mensaje } from 'src/app/core/enums/enums';
import { mapResponseException } from 'src/app/core/utils/exception-util';
import {
    errorMessage,
    infoMessage,
    warnMessage,
} from 'src/app/core/utils/message-util';
import { TrabajoDeGradoService } from '../../../services/trabajoDeGrado.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: 'documento-formatoEvaluadores',
    templateUrl: 'documento-formatoEvaluadores.component.html',
    styleUrls: ['documento-formatoEvaluadores.component.scss'],
})
export class DocumentoformatoEvaluadoresComponent implements OnInit {
    @Output() formReady = new EventEmitter<FormGroup>();
    @Output() formatoEvaluadoresPdfGenerated = new EventEmitter<File>();

    @ViewChild('formatoEvaluadores') formatoEvaluadores!: ElementRef;

    private estudianteSubscription: Subscription;
    private tituloSubscription: Subscription;
    private evaluadorInternoSubscription: Subscription;
    private evaluadorExternoSubscription: Subscription;

    formatoEvaluadoresForm: FormGroup;

    loading = false;

    fechaActual: Date;
    firmaDirector: string;
    logoImage: string;
    footerImage: string;
    estudianteSeleccionado: any;

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private trabajoDeGradoService: TrabajoDeGradoService
    ) {}

    get titulo(): FormControl {
        return this.formatoEvaluadoresForm.get('propuesta') as FormControl;
    }

    get estudiante(): FormControl {
        return this.formatoEvaluadoresForm.get('estudiante') as FormControl;
    }

    get experto(): FormControl {
        return this.formatoEvaluadoresForm.get('juradoExterno') as FormControl;
    }

    get docente(): FormControl {
        return this.formatoEvaluadoresForm.get('juradoInterno') as FormControl;
    }

    ngOnInit() {
        this.initForm();
        this.fechaActual = new Date();
        this.tituloSubscription =
            this.trabajoDeGradoService.tituloSeleccionadoSubject$.subscribe({
                next: (response) => {
                    if (response) {
                        this.titulo.setValue(response);
                    }
                },
                error: (e) => this.handlerResponseException(e),
            });

        this.estudianteSubscription =
            this.trabajoDeGradoService.estudianteSeleccionado$.subscribe({
                next: (response) => {
                    if (response) {
                        this.estudianteSeleccionado = response;
                        this.estudiante.setValue(
                            this.nombreCompletoEstudiante(response)
                        );
                    }
                },
                error: (e) => this.handlerResponseException(e),
            });

        this.evaluadorExternoSubscription =
            this.trabajoDeGradoService.evaluadorExternoSeleccionadoSubject$.subscribe(
                {
                    next: (response) => {
                        if (response) {
                            this.experto.setValue(response);
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
                            this.docente.setValue(response);
                        }
                    },
                    error: (e) => this.handlerResponseException(e),
                }
            );
    }

    initForm(): void {
        this.formatoEvaluadoresForm = this.fb.group({
            consecutivo: ['MC/051', Validators.required],
            juradoExterno: [null, Validators.required],
            juradoInterno: [null, Validators.required],
            asunto: [null, Validators.required],
            estudiante: [null, Validators.required],
            propuesta: [null, Validators.required],
            docente: [null, Validators.required],
            fechaSesion: [null, Validators.required],
            fechaRespuesta: [null, Validators.required],
            coordinadora: [null, Validators.required],
        });

        this.formReady.emit(this.formatoEvaluadoresForm);

        var logoImg = new Image();
        logoImg.src = 'assets/layout/images/logoUnicauca.png';
        logoImg.onload = () => {
            this.logoImage = this.getBase64Image(logoImg);
        };

        var footerImg = new Image();
        footerImg.src = 'assets/layout/images/logosIcontec.png';
        footerImg.onload = () => {
            this.footerImage = this.getBase64Image(footerImg);
        };
    }

    ngOnDestroy() {
        if (this.tituloSubscription) {
            this.tituloSubscription.unsubscribe();
        }
        if (this.estudianteSubscription) {
            this.estudianteSubscription.unsubscribe();
        }
        if (this.evaluadorExternoSubscription) {
            this.evaluadorExternoSubscription.unsubscribe();
        }
        if (this.evaluadorInternoSubscription) {
            this.evaluadorInternoSubscription.unsubscribe();
        }
    }

    getBase64Image(img: HTMLImageElement) {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL('image/png');
    }

    onFirmaChange(event: any, fieldName: string) {
        const input = event && event.files ? event : { files: [] };
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (fieldName === 'firmaDirector') {
                    this.firmaDirector = reader.result as string;
                }
            };
            reader.readAsDataURL(file);
            const patchObject = {};
            patchObject[fieldName] = file;
            this.formatoEvaluadoresForm.patchValue(patchObject);
        }
    }

    generateDocDefinition() {
        const formValues = this.formatoEvaluadoresForm.value;
        const fechaActual = new Date().toLocaleDateString();

        return {
            content: [
                {
                    columns: [
                        {
                            text: 'Maestría en Computación\nFacultad de Ingeniería Electrónica y Telecomunicaciones',
                            fontSize: 14,
                            alignment: 'left',
                            margin: [0, 5, 0, 5],
                            opacity: 0.6,
                        },
                        {
                            image: this.logoImage,
                            width: 50,
                            height: 70,
                            margin: [0, -10, 0, 5],
                            alignment: 'right',
                            opacity: 0.6,
                        },
                    ],
                },
                {
                    text: formValues.consecutivo,
                    alignment: 'justify',
                    margin: [0, 0, 0, 5],
                },
                {
                    text: 'Popayán, ' + fechaActual,
                    alignment: 'justify',
                    margin: [0, 0, 0, 10],
                },
                {
                    text: 'Doctor',
                    style: 'value',
                    alignment: 'justify',
                },
                {
                    text: this.experto.value?.nombres,
                    style: 'value',
                    alignment: 'justify',
                },
                {
                    text: this.experto.value?.universidad,
                    style: 'value',
                    alignment: 'justify',
                },
                {
                    text: this.experto.value?.correo,
                    style: 'value',
                    alignment: 'justify',
                },
                {
                    text: 'Jurado Externo',
                    style: 'value',
                    alignment: 'justify',
                    margin: [0, 0, 0, 5],
                },
                {
                    text: 'Doctor',
                    style: 'value',
                    alignment: 'justify',
                },
                {
                    text: this.experto.value?.nombres,
                    style: 'value',
                    alignment: 'justify',
                },
                {
                    text: 'Docente',
                    style: 'value',
                    alignment: 'justify',
                },
                {
                    text: this.experto.value?.universidad,
                    style: 'value',
                    alignment: 'justify',
                },
                {
                    text: this.experto.value?.correo,
                    style: 'value',
                    alignment: 'justify',
                },
                {
                    text: 'Jurado Interno',
                    style: 'value',
                    alignment: 'justify',
                },
                {
                    text:
                        'Asunto: ' +
                        formValues.asunto +
                        ' ' +
                        formValues.estudiante,
                    style: 'value',
                    margin: [0, 10, 0, 5],
                    alignment: 'justify',
                },
                {
                    text: 'Estimados profesores, reciban un cordial saludo,',
                    margin: [0, 0, 0, 5],
                    alignment: 'justify',
                    style: 'value',
                },
                {
                    text:
                        'El comité del programa de Maestría en Computación reunido en su sesión ordinaria del día ' +
                        new Date(formValues.fechaSesion).toLocaleDateString() +
                        ' revisó la solicitud de presentación del examen de valoración de la propuesta denominada “' +
                        formValues.propuesta +
                        '” del estudiante ' +
                        formValues.estudiante +
                        ', bajo la dirección del PhD. ' +
                        formValues.docente +
                        '.',
                    style: 'value',
                    margin: [0, 0, 0, 5],
                    alignment: 'justify',
                },
                {
                    text:
                        'En la reunión mencionada, el Comité aceptó la sugerencia de evaluadores realizada por el profesor ' +
                        formValues.docente +
                        ', y en este sentido, nos permitimos por medio del presente oficio, notificarle su designación como evaluador del examen de valoración. Adjunto a este documento encontrará los documentos que entrega el estudiante para soportar la solicitud.',
                    style: 'value',

                    margin: [0, 0, 0, 5],
                    alignment: 'justify',
                },
                {
                    text:
                        'La Evaluación del Examen de Valoración implica la revisión del documento de anteproyecto, junto con el examen de valoración y los avances reportados en función de lo propuesto en el anteproyecto. Agradecemos la retroalimentación, aportes, observaciones y correcciones que pueda brindar al estudiante ' +
                        formValues.estudiante +
                        ' sobre la documentación presentada en el examen de valoración.',
                    style: 'value',
                    margin: [0, 0, 0, 5],
                    alignment: 'justify',
                },
                {
                    text: 'La evaluación se realizará por escrito, no habrá sustentación presencial o virtual y debe contener dos ítems importantes:',
                    style: 'value',
                    margin: [0, 0, 0, 5],
                    alignment: 'justify',
                },

                {
                    text: '1. La decisión: APROBADO, APLAZADO, NO APROBADO. Si se aplaza (normalmente por cambios de fondo en la propuesta) el estudiante tiene un máximo de 15 días para hacer llegar las correcciones. Si hay cambios de forma, el documento se aprueba y el estudiante entrega el documento final con las correcciones a la coordinación, no se hace necesario ningún trámite adicional de parte del evaluador. Esta decisión debe consignarse en el Formato B (ver adjunto).',
                    style: 'value',
                    alignment: 'justify',
                    margin: [0, 0, 0, 5],
                },
                {
                    text: '2. Las observaciones o comentarios pueden ser incluidos en los documentos de word/pdf que se entregan al evaluador (anteproyecto, examen de valoración y anexos según el caso) o en el Formato C (ver adjunto).',
                    style: 'value',
                    alignment: 'justify',
                    margin: [0, 0, 0, 5],
                },
                {
                    text: `Para facilidad de los evaluadores, cada uno puede entregar los formatos B y C en forma independiente a la coordinación. Agradecemos que su respuesta sea enviada antes del ${new Date(
                        formValues.fechaRespuesta
                    ).toLocaleDateString()}`,
                    style: 'value',
                    margin: [0, 0, 0, 5],
                    alignment: 'justify',
                },
                {
                    text:
                        'Cualquier inquietud con relación a la evaluación favor comunicarse con el director del trabajo de grado, PhD. ' +
                        formValues.docente +
                        ' (email: ' +
                        formValues.docente +
                        ').',
                    style: 'value',
                    margin: [0, 0, 0, 5],
                    alignment: 'justify',
                },
                {
                    text:
                        'Si considera procedente interactuar con el estudiante para aclarar algún aspecto de la propuesta, siéntase en libertad de hacerlo al email: ' +
                        formValues.estudiante +
                        '.',
                    style: 'value',
                    margin: [0, 0, 0, 5],
                    alignment: 'justify',
                },
                {
                    text: 'En nombre del Comité de Programa de la Maestría en Computación de la Facultad de Ingeniería Electrónica y Telecomunicaciones, les expreso mis más sinceros agradecimientos por toda su colaboración.',
                    style: 'value',
                    margin: [0, 0, 0, 5],
                    alignment: 'justify',
                },
                {
                    text: 'Quedo atenta a cualquier inquietud o comentario.',
                    style: 'value',
                    margin: [0, 0, 0, 5],
                    alignment: 'justify',
                },
                {
                    text: 'Universitariamente,',
                    style: 'value',
                    margin: [0, 0, 0, 10],
                    alignment: 'justify',
                },
                {
                    text: 'Luz Marina Sierra Martínez, PhD.',
                    style: 'value',
                    alignment: 'justify',
                },
                {
                    text: 'Coordinadora Maestría Computación',
                    style: 'value',
                    alignment: 'justify',
                },
                {
                    text: 'E-mail: maestriacomputacion@unicauca.edu.co',
                    style: 'value',
                    alignment: 'justify',
                },
            ],
            footer: (currentPage, pageCount) => {
                return {
                    columns: [
                        {
                            stack: [
                                {
                                    image: this.footerImage,
                                    width: 100,
                                    height: 60,
                                    alignment: 'left',
                                    margin: [0, 5, 0, 5],
                                    opacity: 0.6,
                                },
                            ],
                            width: 'auto',
                        },
                        {
                            stack: [
                                {
                                    text: 'Hacia una Universidad comprometida con la paz territorial',
                                    alignment: 'center',
                                    margin: [0, 2, 0, 2],
                                    opacity: 0.6,
                                },
                                {
                                    canvas: [
                                        {
                                            type: 'line',
                                            x1: 0,
                                            y1: 0,
                                            x2: 320,
                                            y2: 0,
                                            lineWidth: 1,
                                            color: '#ff0000',
                                        },
                                    ],
                                    margin: [0, 2, 0, 2],
                                    alignment: 'center',
                                    opacity: 0.6,
                                },
                                {
                                    text: 'Facultad de Ingeniería Electrónica y Telecomunicaciones\nSector Tulcán   Popayán - Cauca - Colombia\nConmutador 8209800 Exts. 2145 – 2103\nmaestriacomputacion@unicauca.edu.co   www.unicauca.edu.co/maestriacomputacion',
                                    alignment: 'center',
                                    fontSize: 10,
                                    margin: [0, 5, 0, 5],
                                    opacity: 0.6,
                                },
                            ],
                            width: '*',
                        },
                    ],
                    margin: [40, 60, 0, 0],
                };
            },
            styles: {
                title: {
                    bold: true,
                    fontSize: 11,
                },
                value: {
                    fontSize: 11,
                },
            },
            pageMargins: [40, 40, 40, 160],
        };
    }

    onDownload() {
        if (this.formatoEvaluadoresForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            const docDefinition = this.generateDocDefinition();
            pdfMake.createPdf(docDefinition).getBlob((pdfBlob: Blob) => {
                const file = new File(
                    [pdfBlob],
                    `${this.estudianteSeleccionado.codigo} - formatoOficioDirigidoEvaluadores.pdf`,
                    {
                        type: 'application/pdf',
                    }
                );
                const link = document.createElement('a');
                link.download = file.name;
                link.href = URL.createObjectURL(file);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
            });
        }
    }

    onAdjuntar() {
        if (this.formatoEvaluadoresForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            const docDefinition = this.generateDocDefinition();
            pdfMake.createPdf(docDefinition).getBlob((pdfBlob: Blob) => {
                const file = new File(
                    [pdfBlob],
                    `${this.estudianteSeleccionado.codigo} - formatoOficioDirigidoEvaluadores.pdf`,
                    {
                        type: 'application/pdf',
                    }
                );
                this.formatoEvaluadoresPdfGenerated.emit(file);
                this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
            });
        }
    }

    nombreCompletoEstudiante(e: any) {
        return `${e.nombre} ${e.apellido}`;
    }

    handlerResponseException(response: any) {
        if (response.status !== 500) return;
        const mapException = mapResponseException(response.error);
        mapException.forEach((value) => {
            this.messageService.add(errorMessage(value));
        });
    }

    private handleSuccessMessage(message: string) {
        this.messageService.add(infoMessage(message));
    }

    private handleWarningMessage(message: string) {
        this.messageService.clear();
        this.messageService.add(warnMessage(message));
    }
}
