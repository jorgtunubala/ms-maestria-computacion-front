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
    selector: 'documento-formatoG',
    templateUrl: 'documento-formatoG.component.html',
    styleUrls: ['documento-formatoG.component.scss'],
})
export class DocumentoFormatoGComponent implements OnInit {
    @Input() trabajoDeGradoId: any;
    @Input() juradoInterno: any;
    @Input() juradoExterno: any;
    @Output() formReady = new EventEmitter<FormGroup>();
    @Output() formatoGPdfGenerated = new EventEmitter<File>();

    @ViewChild('formatoG') formatoG!: ElementRef;

    estudianteSubscription: Subscription;
    tituloSubscription: Subscription;

    formatoGForm: FormGroup;

    loading = false;

    estudianteSeleccionado: any;
    firmaCoordinador: string;
    footerImage: string;
    logoImage: string;

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private trabajoDeGradoService: TrabajoDeGradoService,
        private resolucionService: ResolucionService
    ) {}

    get estudiante(): FormControl {
        return this.formatoGForm.get('estudiante') as FormControl;
    }

    get titulo(): FormControl {
        return this.formatoGForm.get('titulo') as FormControl;
    }

    get director(): FormControl {
        return this.formatoGForm.get('director') as FormControl;
    }

    async loadDirector() {
        try {
            const response = await firstValueFrom(
                this.resolucionService.getResolucionDocente(
                    this.trabajoDeGradoId
                )
            );
            if (response) {
                this.director.setValue(response.director.nombres);
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
                        this.formatoGForm
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
        const today = new Date();
        const dia = today.getDate();
        const mes = today.getMonth() + 1;
        const anio = today.getFullYear();

        const fecha = `${dia} de ${mes} de ${anio}`;

        this.formatoGForm = this.fb.group({
            consecutivo: ['MC/013', Validators.required],
            fecha: [fecha, Validators.required],
            facultad: [
                'Ingeniería Electrónica y Telecomunicaciones',
                Validators.required,
            ],
            programa: ['Maestría en Computación', Validators.required],
            estudiante: [null, Validators.required],
            titulo: [null, Validators.required],
            director: [null, Validators.required],
            observaciones: [null, Validators.required],
            juradoInterno: [this.juradoInterno.nombres, Validators.required],
            juradoExterno: [this.juradoExterno.nombres, Validators.required],
            firmaCoordinador: [null, Validators.required],
        });

        this.formReady.emit(this.formatoGForm);

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

    onFirmaChange(event: any, fieldName: string) {
        const input = event && event.files ? event : { files: [] };
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (fieldName === 'firmaCoordinador') {
                    this.firmaCoordinador = reader.result as string;
                }
            };
            reader.readAsDataURL(file);
            const patchObject = {};
            patchObject[fieldName] = file;
            this.formatoGForm.patchValue(patchObject);
        }
    }

    generateDocDefinition() {
        const formValues = this.formatoGForm.value;
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
                    style: 'subheader',
                    alignment: 'left',
                },
                {
                    text: 'TESIS DE POSGRADO',
                    style: 'subheader',
                    alignment: 'center',
                },
                {
                    columns: [
                        { text: 'FORMATO G:', style: 'label', width: '25%' },
                        {
                            text: 'REMISION DEL TRABAJO FINAL AL CONSEJO DE FACULTAD POR EL COORDINADOR DEL COMITÉ DEL PROGRAMA',
                            style: 'value',
                            width: '75%',
                        },
                    ],
                },
                {
                    columns: [
                        { text: 'PROGRAMA:', style: 'label', width: '25%' },
                        {
                            text: formValues.programa,
                            style: 'value',
                            width: '75%',
                        },
                    ],
                },
                {
                    columns: [
                        { text: 'TITULO:', style: 'label', width: '25%' },
                        {
                            text: formValues.titulo,
                            style: 'value',
                            width: '75%',
                        },
                    ],
                },
                {
                    columns: [
                        { text: 'ESTUDIANTE:', style: 'label', width: '25%' },
                        {
                            text: formValues.estudiante,
                            style: 'value',
                            width: '75%',
                        },
                    ],
                },
                {
                    columns: [
                        { text: 'DIRECTOR:', style: 'label', width: '25%' },
                        {
                            text: formValues.director,
                            style: 'value',
                            width: '75%',
                        },
                    ],
                    margin: [0, 0, 0, 20],
                },
                {
                    text: 'JURADOS SUGERIDOS Y DATOS DE CONTACTO:',
                    style: 'label',
                },
                {
                    text: `Jurado Interno: ${this.juradoInterno?.nombres}, ${this.juradoInterno?.correo}, ${this.juradoInterno?.universidad}\nJurado Externo: ${this.juradoExterno?.nombres}, ${this.juradoExterno?.correo}, ${this.juradoExterno?.universidad}`,
                    style: 'value',
                },
                { text: 'OBSERVACIONES:', style: 'label' },
                {
                    text: formValues?.observaciones,
                    style: 'value',
                },
                {
                    columns: [
                        { text: 'FECHA:', style: 'label', width: '25%' },
                        {
                            text: fechaActual,
                            style: 'value',
                            width: '75%',
                        },
                    ],
                    margin: [0, 0, 0, 20],
                },
                {
                    columns: [
                        { text: 'FIRMA:', style: 'label', width: '25%' },
                        {
                            image: this.firmaCoordinador,
                            width: 80,
                            height: 60,
                            margin: [0, 5, 0, 0],
                            alignment: 'left',
                            style: 'value',
                        },
                    ],
                },
                {
                    columns: [
                        { text: '', width: '25%' },
                        {
                            text: 'Dra. Luz Marina Sierra Martínez (Coordinadora Comité de Programa)',
                            width: '75%',
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
            },
        };
    }

    onDownload() {
        if (this.formatoGForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            const docDefinition = this.generateDocDefinition();
            pdfMake.createPdf(docDefinition).getBlob((pdfBlob: Blob) => {
                const file = new File(
                    [pdfBlob],
                    `${this.estudianteSeleccionado.codigo} - formatoG.pdf`,
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
        if (this.formatoGForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            const docDefinition = this.generateDocDefinition();
            pdfMake.createPdf(docDefinition).getBlob((pdfBlob: Blob) => {
                const file = new File(
                    [pdfBlob],
                    `${this.estudianteSeleccionado.codigo} - formatoG.pdf`,
                    {
                        type: 'application/pdf',
                    }
                );
                this.formatoGPdfGenerated.emit(file);
                this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
            });
        }
    }

    getFormControl(formControlName: string): FormControl {
        return this.formatoGForm.get(formControlName) as FormControl;
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
