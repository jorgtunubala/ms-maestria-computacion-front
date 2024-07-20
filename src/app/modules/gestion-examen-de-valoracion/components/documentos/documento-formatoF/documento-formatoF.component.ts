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
    selector: 'documento-formatoF',
    templateUrl: 'documento-formatoF.component.html',
    styleUrls: ['documento-formatoF.component.scss'],
})
export class DocumentoFormatoFComponent implements OnInit {
    @Output() formReady = new EventEmitter<FormGroup>();
    @Output() formatoFPdfGenerated = new EventEmitter<File>();

    @ViewChild('formatoF') formatoF!: ElementRef;

    private estudianteSubscription: Subscription;
    private tituloSubscription: Subscription;

    formatoFForm: FormGroup;

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
        return this.formatoFForm.get('titulo') as FormControl;
    }

    get estudiante(): FormControl {
        return this.formatoFForm.get('estudiante') as FormControl;
    }

    get experto(): FormControl {
        return this.formatoFForm.get('juradoExterno') as FormControl;
    }

    get docente(): FormControl {
        return this.formatoFForm.get('juradoInterno') as FormControl;
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
    }

    initForm(): void {
        this.formatoFForm = this.fb.group({
            titulo: [null, Validators.required],
            estudiante: [null, Validators.required],
            director: [null, Validators.required],
            trabajoCumpleSi: [false, Validators.required],
            trabajoCumpleNo: [false, Validators.required],
            documentoTerminadoNo: [false, Validators.required],
            documentoTerminadoSi: [false, Validators.required],
            jurados: [null, Validators.required],
            observaciones: [null],
            firmaDirector: [null, Validators.required],
        });

        this.formReady.emit(this.formatoFForm);

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
        this.initValueChangeHandlers();
    }

    initValueChangeHandlers(): void {
        this.addToggleHandler('trabajoCumpleSi', 'trabajoCumpleNo');
        this.addToggleHandler('trabajoCumpleNo', 'trabajoCumpleSi');
        this.addToggleHandler('documentoTerminadoSi', 'documentoTerminadoNo');
        this.addToggleHandler('documentoTerminadoNo', 'documentoTerminadoSi');
    }

    addToggleHandler(controlName: string, oppositeControlName: string): void {
        this.formatoFForm.get(controlName).valueChanges.subscribe({
            next: (response) => {
                if (typeof response === 'boolean') {
                    const oppositeControl =
                        this.formatoFForm.get(oppositeControlName);
                    if (response) {
                        oppositeControl.disable({ emitEvent: false });
                    } else {
                        oppositeControl.enable({ emitEvent: false });
                    }
                }
            },
        });
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
            this.formatoFForm.patchValue(patchObject);
        }
    }

    generateDocDefinition() {
        const formValues = this.formatoFForm.value;
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
                    text: 'TESIS DE POSGRADO',
                    style: 'header',
                    alignment: 'center',
                },
                {
                    columns: [
                        { text: 'FORMATO F:', style: 'label', width: '25%' },
                        {
                            text: 'REMISION DEL DOCUMENTO FINAL AL COMITÉ DE PROGRAMA POR EL DIRECTOR RESPECTIVO',
                            style: 'value',
                            width: '75%',
                        },
                    ],
                },
                {
                    columns: [
                        { text: 'TITULO:', style: 'label', width: '25%' },
                        {
                            text:
                                formValues.titulo ||
                                '______________________________',
                            style: 'value',
                            width: '75%',
                        },
                    ],
                },
                {
                    columns: [
                        { text: 'ESTUDIANTE:', style: 'label', width: '25%' },
                        {
                            text:
                                formValues.estudiante ||
                                '______________________________',
                            style: 'value',
                            width: '75%',
                        },
                    ],
                },
                {
                    columns: [
                        { text: 'DIRECTOR:', style: 'label', width: '25%' },
                        {
                            text:
                                formValues.director ||
                                '______________________________',
                            style: 'value',
                            width: '75%',
                            margin: [0, 5, 0, 0],
                        },
                    ],
                },
                {
                    text: 'A) EL TRABAJO CUMPLE CON LAS CONDICIONES DE ENTREGA? SI (  ) NO (  )',
                    style: 'label',
                },
                {
                    columns: [
                        { text: 'SI', style: 'value', width: '10%' },
                        {
                            text: formValues.trabajoCumpleSi ? '( X )' : '(  )',
                            style: 'value',
                            width: '10%',
                        },
                        { text: 'NO', style: 'value', width: '10%' },
                        {
                            text: formValues.trabajoCumpleNo ? '( X )' : '(  )',
                            style: 'value',
                            width: '10%',
                        },
                    ],
                },
                {
                    text: 'B) DOCUMENTO Y ANEXOS COMPLETAMENTE TERMINADOS? SI (  ) NO (  )',
                    style: 'label',
                },
                {
                    columns: [
                        { text: 'SI', style: 'value', width: '10%' },
                        {
                            text: formValues.documentoTerminadoSi
                                ? '( X )'
                                : '(  )',
                            style: 'value',
                            width: '10%',
                        },
                        { text: 'NO', style: 'value', width: '10%' },
                        {
                            text: formValues.documentoTerminadoNo
                                ? '( X )'
                                : '(  )',
                            style: 'value',
                            width: '10%',
                        },
                    ],
                },
                { text: 'OBSERVACIONES:', style: 'label' },
                {
                    text:
                        formValues?.observaciones ||
                        '______________________________',
                    style: 'value',
                },
                {
                    text: 'JURADOS SUGERIDOS Y DATOS DE CONTACTO:',
                    style: 'label',
                },
                {
                    text:
                        formValues.jurados || '______________________________',
                    style: 'value',
                },
                {
                    columns: [
                        { text: 'FECHA:', style: 'label', width: '25%' },
                        {
                            text:
                                fechaActual || '______________________________',
                            style: 'value',
                            width: '75%',
                        },
                    ],
                },
                {
                    columns: [
                        { text: 'FIRMA:', style: 'label', width: '25%' },
                        {
                            image: this.firmaDirector,
                            width: 80,
                            height: 60,
                            margin: [0, 5, 0, 0],
                            alignment: 'left',
                            style: 'value',
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
        if (this.formatoFForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            const docDefinition = this.generateDocDefinition();
            pdfMake.createPdf(docDefinition).getBlob((pdfBlob: Blob) => {
                const file = new File(
                    [pdfBlob],
                    `${this.estudianteSeleccionado.codigo} - formatoF.pdf`,
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
        if (this.formatoFForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            const docDefinition = this.generateDocDefinition();
            pdfMake.createPdf(docDefinition).getBlob((pdfBlob: Blob) => {
                const file = new File(
                    [pdfBlob],
                    `${this.estudianteSeleccionado.codigo} - formatoF.pdf`,
                    {
                        type: 'application/pdf',
                    }
                );
                this.formatoFPdfGenerated.emit(file);
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
