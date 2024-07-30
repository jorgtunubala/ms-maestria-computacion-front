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
import { Subscription } from 'rxjs';
import { saveAs } from 'file-saver';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as PizZip from 'pizzip';
import * as JSZipUtils from 'pizzip/utils/index.js';
import * as Docxtemplater from 'docxtemplater';
import { Mensaje } from 'src/app/core/enums/enums';
import { Estudiante } from 'src/app/modules/gestion-estudiantes/models/estudiante';
import { mapResponseException } from 'src/app/core/utils/exception-util';
import {
    errorMessage,
    infoMessage,
    warnMessage,
} from 'src/app/core/utils/message-util';
import { TrabajoDeGradoService } from '../../../services/trabajoDeGrado.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

interface Evaluador {
    id?: number;
    nombres?: string;
    correo?: string;
    universidad?: string;
}

@Component({
    selector: 'documento-formatoB',
    templateUrl: 'documento-formatoB.component.html',
    styleUrls: ['documento-formatoB.component.scss'],
})
export class DocumentoFormatoBComponent implements OnInit {
    @Output() formReady = new EventEmitter<FormGroup>();
    @Output() formatoBDocxGenerated = new EventEmitter<any>();
    @Input() formatoBEv1: File;
    @Input() formatoBEv2: File;
    @Input() evaluador: Evaluador;

    @ViewChild('formatoB') formatoB!: ElementRef;

    private estudianteSubscription: Subscription;
    private tituloSubscription: Subscription;

    formatoBForm: FormGroup;
    footerImage: string;
    logoImage: string;

    isPending = true;
    loading = false;

    estudianteSeleccionado: Estudiante = {};
    estados: string[] = ['Aprobado', 'Aplazado', 'No Aprobado'];

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private trabajoDeGradoService: TrabajoDeGradoService
    ) {}

    get titulo(): FormControl {
        return this.formatoBForm.get('titulo') as FormControl;
    }

    get estudiante(): FormControl {
        return this.formatoBForm.get('estudiante') as FormControl;
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
                        this.estudiante.setValue(
                            this.nombreCompletoEstudiante(response)
                        );
                    }
                },
                error: (e) => this.handlerResponseException(e),
            });
    }

    initForm(): void {
        this.formatoBForm = this.fb.group({
            fecha: [new Date(), Validators.required],
            programa: ['Maestría en Computación', Validators.required],
            titulo: [null, Validators.required],
            estudiante: [null, Validators.required],
            conceptoJurado: [null, Validators.required],
        });
        this.formatoBForm.get('fecha').disable();
        this.formatoBForm.get('conceptoJurado').disable();
        this.formReady.emit(this.formatoBForm);

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
        if (this.tituloSubscription) {
            this.tituloSubscription.unsubscribe();
        }
        if (this.estudianteSubscription) {
            this.estudianteSubscription.unsubscribe();
        }
    }

    getFormattedDate(): string {
        const rawDate = new Date();
        const day = rawDate.getDate();
        const month = rawDate.toLocaleString('default', { month: 'short' });
        const year = rawDate.getFullYear();
        return `${day} de ${month} de ${year}`;
    }

    generateDocDefinition() {
        const formValues = this.formatoBForm.value;
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
                    text: 'FORMATO B',
                    style: 'header',
                    alignment: 'center',
                },
                {
                    text: `ACTA DE EXAMEN DE VALORACIÓN`,
                    style: 'subheader',
                    alignment: 'center',
                },
                {
                    text: `Popayán, ${this.getFormattedDate()}`,
                    style: 'subheader',
                    alignment: 'center',
                },
                {
                    columns: [
                        { text: 'Programa:', style: 'label', width: '25%' },
                        {
                            text: formValues.programa,
                            style: 'value',
                            width: '75%',
                        },
                    ],
                    margin: [0, 10, 0, 10],
                },
                {
                    columns: [
                        { text: 'Titulo:', style: 'label', width: '25%' },
                        {
                            text: formValues.titulo,
                            style: 'value',
                            width: '75%',
                        },
                    ],
                    margin: [0, 10, 0, 10],
                },
                {
                    columns: [
                        { text: 'Estudiante:', style: 'label', width: '25%' },
                        {
                            text: formValues.estudiante,
                            style: 'value',
                            width: '75%',
                        },
                    ],
                    margin: [0, 10, 0, 10],
                },
                {
                    columns: [
                        { text: 'Jurado:', style: 'label', width: '25%' },
                        {
                            text:
                                this.evaluador.nombres +
                                ', ' +
                                this.evaluador.universidad +
                                ', ' +
                                this.evaluador.correo,
                            style: 'value',
                            width: '75%',
                        },
                    ],
                    margin: [0, 10, 0, 10],
                },
                {
                    columns: [
                        { text: 'Fecha:', style: 'label', width: '25%' },
                        {
                            text: this.getFormattedDate(),
                            style: 'value',
                            width: '75%',
                        },
                    ],
                    margin: [0, 10, 0, 10],
                },
                {
                    columns: [
                        {
                            text: 'Concepto del Jurado:',
                            style: 'label',
                            width: '25%',
                        },
                        {
                            stack: [
                                {
                                    text: 'Aprobado',
                                    style: 'value',
                                    width: '75%',
                                },
                                {
                                    text: 'Aplazado',
                                    style: 'value',
                                    width: '75%',
                                },
                                {
                                    text: 'No Aprobado',
                                    style: 'value',
                                    width: '75%',
                                },
                            ],
                        },
                    ],
                    margin: [0, 10, 0, 30],
                },
                {
                    columns: [
                        {
                            text: 'Firman',
                            style: 'value',
                            width: '100%',
                        },
                    ],
                },
                {
                    columns: [
                        {
                            stack: [
                                {
                                    canvas: [
                                        {
                                            type: 'line',
                                            x1: 0,
                                            y1: 0,
                                            x2: 300,
                                            y2: 0,
                                            lineWidth: 1,
                                        },
                                    ],
                                },
                                {
                                    text:
                                        this.evaluador.nombres +
                                        ', ' +
                                        this.evaluador.universidad,
                                    style: 'value',
                                    width: '100%',
                                },
                            ],
                        },
                    ],
                    margin: [0, 60, 0, 0],
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
            },
        };
    }

    onDownload() {
        this.isPending = false;
        if (this.formatoBForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            this.loading = true;
            const formValues = this.formatoBForm.value;

            const docData: any = {
                fecha: this.getFormattedDate(),
                programa: 'Maestría en Computación',
                estudiante: formValues.estudiante,
                titulo: formValues.titulo,
                jurado:
                    this.evaluador.nombres +
                    ', ' +
                    this.evaluador.correo +
                    ',' +
                    this.evaluador.universidad,
                juradoFirma:
                    this.evaluador.nombres + ', ' + this.evaluador.universidad,
            };

            this.loadFile(
                'assets/plantillas/formatoB.docx',
                (error: any, content: any) => {
                    if (error) {
                        throw error;
                    }
                    const zip = new PizZip(content);
                    const doc = new Docxtemplater(zip, {
                        paragraphLoop: true,
                        linebreaks: true,
                    });

                    doc.setData(docData);

                    try {
                        doc.render();
                    } catch (error) {
                        console.error(error);
                        throw error;
                    }

                    const out = doc.getZip().generate({
                        type: 'blob',
                        mimeType:
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    });

                    saveAs(out, 'formatoB.docx');
                    this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
                }
            );
            this.loading = false;
        }
    }

    loadFile(url: string, callback: (error: any, content: any) => void) {
        JSZipUtils.default.getBinaryContent(url, callback);
    }

    onInsertar() {
        if (this.formatoBForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            this.loading = true;
            const formValues = this.formatoBForm.value;
            const docData: any = {
                fecha: this.getFormattedDate(),
                programa: 'Maestría en Computación',
                estudiante: formValues.estudiante,
                titulo: formValues.titulo,
                jurado:
                    this.evaluador.nombres +
                    ', ' +
                    this.evaluador.correo +
                    ',' +
                    this.evaluador.universidad,
                juradoFirma:
                    this.evaluador.nombres + ', ' + this.evaluador.universidad,
            };

            let fileDoc: Blob;

            this.loadFile(
                'assets/plantillas/formatoB.docx',
                (error: any, content: any) => {
                    if (error) {
                        throw error;
                    }
                    const zip = new PizZip(content);
                    const doc = new Docxtemplater(zip, {
                        paragraphLoop: true,
                        linebreaks: true,
                    });

                    doc.setData(docData);

                    try {
                        doc.render();
                    } catch (error) {
                        console.error(error);
                        throw error;
                    }

                    fileDoc = doc.getZip().generate({
                        type: 'blob',
                        mimeType:
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    });
                }
            );

            const docDefinition = this.generateDocDefinition();
            pdfMake.createPdf(docDefinition).getBlob((pdfBlob: Blob) => {
                const filePdf = new File(
                    [pdfBlob],
                    `${this.estudianteSeleccionado.codigo} - formatoB.pdf`,
                    {
                        type: 'application/pdf',
                    }
                );
                this.formatoBDocxGenerated.emit({
                    doc: fileDoc,
                    pdf: filePdf,
                });
                this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
            });
            this.loading = false;
        }
    }

    getFormControl(formControlName: string): FormControl {
        return this.formatoBForm.get(formControlName) as FormControl;
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
