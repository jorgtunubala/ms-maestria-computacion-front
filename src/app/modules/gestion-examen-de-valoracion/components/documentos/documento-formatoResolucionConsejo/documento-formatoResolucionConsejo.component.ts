import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
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
import { Subscription, firstValueFrom } from 'rxjs';
import { Mensaje } from 'src/app/core/enums/enums';
import { mapResponseException } from 'src/app/core/utils/exception-util';
import {
    errorMessage,
    infoMessage,
    warnMessage,
} from 'src/app/core/utils/message-util';
import { TrabajoDeGradoService } from '../../../services/trabajoDeGrado.service';
import { ResolucionService } from '../../../services/resolucion.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: 'documento-formatoResolucionConsejo',
    templateUrl: 'documento-formatoResolucionConsejo.component.html',
    styleUrls: ['documento-formatoResolucionConsejo.component.scss'],
})
export class DocumentoFormatoResolucionConsejoComponent implements OnInit {
    @Input() trabajoDeGradoId: any;
    @Output() formReady = new EventEmitter<FormGroup>();
    @Output() formatoResolucionConsejoPdfGenerated = new EventEmitter<File>();

    @ViewChild('formatoResolucionConsejo')
    formatoResolucionConsejo!: ElementRef;

    estudianteSubscription: Subscription;
    tituloSubscription: Subscription;

    formatoResolucionConsejoForm: FormGroup;

    loading = false;

    estudianteSeleccionado: any;
    footerImage: string;
    logoImage: string;

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private trabajoDeGradoService: TrabajoDeGradoService,
        private resolucionService: ResolucionService
    ) {}

    get estudiante(): FormControl {
        return this.formatoResolucionConsejoForm.get(
            'estudiante'
        ) as FormControl;
    }

    get titulo(): FormControl {
        return this.formatoResolucionConsejoForm.get('titulo') as FormControl;
    }

    get director(): FormControl {
        return this.formatoResolucionConsejoForm.get('director') as FormControl;
    }

    async loadDirector() {
        try {
            const response = await firstValueFrom(
                this.resolucionService.getResolucionDocente(
                    this.trabajoDeGradoId
                )
            );
            if (response) {
                this.director.setValue(response?.director?.nombres);
            }
        } catch (error) {
            console.error('Error al obtener el director:', error);
        }
    }

    ngOnInit() {
        this.initForm();

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
                        this.formatoResolucionConsejoForm
                            .get('estudiante')
                            .setValue(
                                this.nombreCompletoEstudiante(
                                    this.estudianteSeleccionado
                                )
                            );
                    }
                },
                error: (e) => this.handlerResponseException(e),
            });

        if (this.trabajoDeGradoId) {
            this.loadDirector();
        }
    }

    initForm(): void {
        this.formatoResolucionConsejoForm = this.fb.group({
            titulo: [null, Validators.required],
            facultad: [
                'Ingeniería Electrónica y Telecomunicaciones',
                Validators.required,
            ],
            programa: ['Maestría en Computación', Validators.required],
            coordinador: ['Luz Marina Sierra Martínez', Validators.required],
            estudiante: [null, Validators.required],
            director: [null, Validators.required],
        });

        this.formReady.emit(this.formatoResolucionConsejoForm);

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

    getBase64Image(img: HTMLImageElement) {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL('image/png');
    }

    ngOnDestroy() {
        if (this.estudianteSubscription) {
            this.estudianteSubscription.unsubscribe();
        }
        if (this.tituloSubscription) {
            this.tituloSubscription.unsubscribe();
        }
    }

    generateDocDefinition() {
        const formValues = this.formatoResolucionConsejoForm.value;

        const today = new Date();
        const dia = today.getDate();
        const mes = today.getMonth() + 1;
        const anio = today.getFullYear();
        const fechaActual = `${dia} de ${mes} de ${anio}`;

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
                    text: 'Popayán, ' + fechaActual,
                    alignment: 'justify',
                    margin: [0, 0, 0, 10],
                },
                {
                    text: 'Doctora',
                    alignment: 'justify',
                },
                {
                    text: formValues.coordinador,
                    alignment: 'justify',
                },
                {
                    text: 'Comité de Programa de Maestría en Computación',
                    alignment: 'justify',
                },
                {
                    text: 'Universidad del Cauca',
                    alignment: 'justify',
                    margin: [0, 0, 0, 5],
                },
                {
                    columns: [
                        { text: 'Asunto:', style: 'label', width: '10%' },
                        {
                            text: `Solicitud de trámite de aprobación formal del anteproyecto de ${formValues.estudiante} (${this.estudianteSeleccionado.codigo}) por parte del Consejo de Facultad de la FIET`,
                            style: 'value',
                            width: '90%',
                        },
                    ],
                },
                {
                    columns: [
                        {
                            text: 'Cordial Saludo,',
                            style: 'value',
                            margin: [0, 10, 0, 10],
                        },
                    ],
                },
                {
                    columns: [
                        {
                            text: `Teniendo en cuenta que los evaluadores del examen de valoración de mi propuesta de trabajo de grado en la Maestría en Computación han dado concepto de APROBADO y que los cambios sugeridos por ellos en los documentos han sido realizados de conformidad con mi director de Trabajo de Grado, por medio del presente oficio, me permito solicitar formalmente al Comité que realice los trámites requeridos para que el Consejo de Facultad de Ingeniería Electrónica y Telecomunicaciones expida la resolución oficial de aprobación de mi trabajo de grado.
                            `,
                            style: 'value',
                            alignment: 'justify',
                        },
                    ],
                },
                {
                    columns: [
                        {
                            text: `Para lo anterior, hago entrega del documento de anteproyecto titulado “${formValues.titulo}” firmado como lo requiere el Consejo de Facultad, en versión digital al correo electrónico de la Maestría en Computación (maestriacomputacion@unicauca.edu.co) y copia digital de las actas de aprobación del examen de valoración firmadas por los evaluadores designados por el Comité de Programa de Maestría en Computación.`,
                            style: 'value',
                            alignment: 'justify',
                        },
                    ],
                },
                {
                    columns: [
                        {
                            text: 'Agradezco de antemano toda su colaboración.',
                            style: 'value',
                            margin: [0, 10, 0, 10],
                        },
                    ],
                },
                {
                    columns: [
                        {
                            text: 'Atentamente,',
                            style: 'value',
                            margin: [0, 5, 0, 10],
                        },
                    ],
                },
                {
                    columns: [
                        {
                            stack: [
                                {
                                    text: `${formValues.estudiante}`,
                                },
                                {
                                    text: 'Estudiante Maestría en Computación',
                                },
                                {
                                    text: `Facultad de ${formValues.facultad}`,
                                },
                                {
                                    text: 'Universidad del Cauca',
                                },
                            ],
                            width: '60%',
                        },
                        {
                            text: `VoBo. ${formValues.director}`,
                            width: '40%',
                        },
                    ],
                },
                {
                    columns: [
                        {
                            text: 'Anexos:',
                            style: 'small',
                            margin: [0, 10, 0, 0],
                        },
                    ],
                },
                {
                    columns: [
                        {
                            text: '1) Anteproyecto digital firmado enviada al correo de la maestría',
                            style: 'small',
                        },
                    ],
                },
                {
                    columns: [
                        {
                            text: '2) Copia de las actas de aprobación del examen de valoración firmadas por los evaluadores',
                            style: 'small',
                        },
                    ],
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
                                    text: 'Facultad de Ingeniería Electrónica y Telecomunicaciones\nCra 2 No. 4N-140 Edif. de Ingenierías - Sector Tulcán Popayán - Cauca - Colombia\nConmutador 8209800 Ext. 2145 maestriacomputacion@unicauca.edu.co\nwww.unicauca.edu.cowww.unicauca.edu.co/maestriacomputacion',
                                    alignment: 'center',
                                    fontSize: 10,
                                    margin: [0, 5, 0, 5],
                                    opacity: 0.6,
                                },
                            ],
                            width: '*',
                        },
                    ],
                    margin: [40, -60, 0, 0],
                };
            },
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 10],
                },
                subheader: {
                    fontSize: 12,
                    bold: true,
                    margin: [0, 0, 0, 10],
                },
                label: {
                    fontSize: 12,
                    bold: true,
                    margin: [0, 10, 0, 2],
                },
                value: {
                    fontSize: 12,
                    margin: [0, 10, 0, 0],
                },
                small: {
                    fontSize: 10,
                    margin: [0, 10, 0, 0],
                },
            },
        };
    }

    onDownload() {
        if (this.formatoResolucionConsejoForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            const docDefinition = this.generateDocDefinition();
            pdfMake.createPdf(docDefinition).getBlob((pdfBlob: Blob) => {
                const file = new File(
                    [pdfBlob],
                    `${this.estudianteSeleccionado.codigo} - Solicitud Ante el Concejo.pdf`,
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

    onInsertar() {
        if (this.formatoResolucionConsejoForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            const docDefinition = this.generateDocDefinition();
            pdfMake.createPdf(docDefinition).getBlob((pdfBlob: Blob) => {
                const file = new File(
                    [pdfBlob],
                    `${this.estudianteSeleccionado.codigo} - Solicitud Ante el Concejo.pdf`,
                    {
                        type: 'application/pdf',
                    }
                );
                this.formatoResolucionConsejoPdfGenerated.emit(file);
                this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
            });
        }
    }

    getFormControl(formControlName: string): FormControl {
        return this.formatoResolucionConsejoForm.get(
            formControlName
        ) as FormControl;
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
