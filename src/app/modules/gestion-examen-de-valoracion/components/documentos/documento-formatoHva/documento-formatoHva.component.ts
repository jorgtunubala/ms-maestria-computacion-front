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
import { Router } from '@angular/router';
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
    selector: 'documento-formatoHva',
    templateUrl: 'documento-formatoHva.component.html',
    styleUrls: ['documento-formatoHva.component.scss'],
})
export class DocumentoFormatoHvaComponent implements OnInit {
    @Output() formReady = new EventEmitter<FormGroup>();
    @Output() formatoHvaPdfGenerated = new EventEmitter<File>();
    @ViewChild('formatoHva') formatoHva!: ElementRef;

    estudianteSubscription: Subscription;

    formatoHvaForm: FormGroup;

    FileFirmaEstudiante: File | null = null;

    loading = false;

    logoImage: string;
    firmaEstudiante: string | ArrayBuffer;
    firmaCoordinador: string | ArrayBuffer;
    estudianteSeleccionado: any;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private messageService: MessageService,
        private trabajoDeGradoService: TrabajoDeGradoService
    ) {}

    get estudiante(): FormControl {
        return this.formatoHvaForm.get('estudiante') as FormControl;
    }

    ngOnInit() {
        this.initForm();

        this.estudianteSubscription =
            this.trabajoDeGradoService.estudianteSeleccionado$.subscribe({
                next: (response) => {
                    if (response) {
                        this.estudianteSeleccionado = response;
                        this.formatoHvaForm
                            .get('nombreEstudiante')
                            .setValue(
                                this.nombreCompletoEstudiante(
                                    this.estudianteSeleccionado
                                )
                            );
                    }
                },
                error: (e) => this.handlerResponseException(e),
            });
    }

    initForm(): void {
        const today = new Date();
        const dia = today.getDate();
        const mes = today.getMonth() + 1;
        const anio = today.getFullYear();

        this.formatoHvaForm = this.fb.group({
            dia: [dia, Validators.required],
            mes: [mes, Validators.required],
            anio: [anio, Validators.required],
            periodoi: [false, Validators.required],
            periodoii: [false, Validators.required],
            anioPeriodo: [anio, Validators.required],
            facultad: ["Ingeniería Electrónica y Telecomunicaciones", Validators.required],
            programa: ["Maestría en Computación", Validators.required],
            nombreEstudiante: [null, Validators.required],
            cedulaCiudadania: [null, Validators.required],
            lugarExpedicion: [null, Validators.required],
            codigo: [null, Validators.required],
            telefonoFijo: [null, Validators.required],
            telefonoCelular: [null, Validators.required],
            codigoSaberPro: [null, Validators.required],
            residenciaActual: [null, Validators.required],
            departamento: [null, Validators.required],
            municipio: [null, Validators.required],
            email: [null, Validators.required],
            firmaEstudiante: [null, Validators.required],
            firmaCoordinador: [null, Validators.required],
            titulo: [null, Validators.required],
            nombreCoordinador: [null, Validators.required],
        });
        this.formReady.emit(this.formatoHvaForm);

        var img = new Image();
        img.src = 'assets/layout/images/logoUnicauca.png';
        img.onload = () => {
            this.logoImage = this.getBase64Image(img);
        };
    }

    ngOnDestroy() {
        if (this.estudianteSubscription) {
            this.estudianteSubscription.unsubscribe();
        }
    }

    onCancel() {
        this.router.navigate(['examen-de-valoracion/solicitud']);
    }

    onAdjuntar() {
        if (this.formatoHvaForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            const docDefinition = this.generateDocDefinition();
            pdfMake.createPdf(docDefinition).getBlob((pdfBlob: Blob) => {
                const file = new File(
                    [pdfBlob],
                    `${this.estudianteSeleccionado.codigo} - formatoHva.pdf`,
                    {
                        type: 'application/pdf',
                    }
                );
                this.formatoHvaPdfGenerated.emit(file);
                this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
            });
        }
    }

    onDownload() {
        if (this.formatoHvaForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            const docDefinition = this.generateDocDefinition();
            pdfMake.createPdf(docDefinition).getBlob((pdfBlob: Blob) => {
                const file = new File(
                    [pdfBlob],
                    `${this.estudianteSeleccionado.codigo} - formatoHva.pdf`,
                    { type: 'application/pdf' }
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

    getBase64Image(img: HTMLImageElement) {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL('image/png');
    }

    generateDocDefinition() {
        const formValues = this.formatoHvaForm.value;
        return {
            content: [
                {
                    table: {
                        widths: ['*', '*', '*'],
                        body: [
                            [
                                {
                                    image: this.logoImage,
                                    width: 50,
                                    height: 70,
                                    margin: [0, 5, 0, 5],
                                    valign: 'middle',
                                    alignment: 'center',
                                    opacity: 0.6,
                                },
                                {
                                    text: 'Gestión Académica Gestión de Facultades y Programas Académicos Estudio Hoja de Vida Académica para Grado',
                                    style: 'header',
                                    colSpan: 2,
                                    valign: 'middle',
                                    alignment: 'center',
                                    margin: [0, 15, 0, 0],
                                    opacity: 0.6,
                                },
                                {},
                            ],
                            [
                                {
                                    text: 'Código: PM-FO-4-FOR-27',
                                    style: 'infoDesc',
                                    alignment: 'center',
                                    opacity: 0.6,
                                },
                                {
                                    text: 'Versión: 1',
                                    style: 'infoDesc',
                                    alignment: 'center',
                                    opacity: 0.6,
                                },
                                {
                                    text: 'Fecha Vigencia: 30-04-2019',
                                    style: 'infoDesc',
                                    alignment: 'center',
                                    opacity: 0.6,
                                },
                            ],
                        ],
                        opacity: 0.6,
                    },
                },
                {
                    table: {
                        widths: ['auto', '*', 'auto', '*', 'auto', '*'],
                        body: [
                            [
                                {
                                    text: 'Día',
                                    style: 'infoDesc',
                                    alignment: 'left',
                                    valign: 'bottom',
                                },
                                {
                                    text: formValues.dia,
                                    style: 'infoValue',
                                    alignment: 'left',
                                    valign: 'bottom',
                                },
                                {
                                    text: 'Mes',
                                    style: 'infoDesc',
                                    alignment: 'left',
                                    valign: 'bottom',
                                },
                                {
                                    text: formValues.mes,
                                    style: 'infoValue',
                                    alignment: 'left',
                                    valign: 'bottom',
                                },
                                {
                                    text: 'Año',
                                    style: 'infoDesc',
                                    alignment: 'left',
                                    valign: 'bottom',
                                },
                                {
                                    text: formValues.anio,
                                    style: 'infoValue',
                                    alignment: 'left',
                                    valign: 'bottom',
                                },
                            ],
                        ],
                    },
                    margin: [0, 5, 0, 0],
                },
                {
                    table: {
                        widths: ['auto', '*', 'auto', '*'],
                        body: [
                            [
                                {
                                    text: 'Periodo I',
                                    style: 'infoDesc',
                                    alignment: 'left',
                                    valign: 'bottom',
                                },
                                {
                                    text: formValues.periodoi ? 'X' : '',
                                    style: 'infoValue',
                                    alignment: 'left',
                                    valign: 'bottom',
                                },
                                {
                                    text: 'Periodo II',
                                    style: 'infoDesc',
                                    alignment: 'left',
                                    valign: 'bottom',
                                },
                                {
                                    text: formValues.periodoii ? 'X' : '',
                                    style: 'infoValue',
                                    alignment: 'left',
                                    valign: 'bottom',
                                },
                            ],
                        ],
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            return i === 0 ? 0 : 1;
                        },
                    },
                    margin: [0, 0, 0, 0],
                },
                {
                    table: {
                        widths: ['25%', '25%', '25%', '25%'],
                        body: [
                            [
                                {
                                    text: 'Facultad:',
                                    style: 'infoLabel',
                                    valign: 'bottom',
                                },
                                {
                                    text: formValues.facultad,
                                    style: 'infoValue',
                                    colSpan: 3,
                                    valign: 'bottom',
                                },
                                {},
                                {},
                            ],
                            [
                                {
                                    text: 'Programa:',
                                    style: 'infoLabel',
                                    valign: 'bottom',
                                },
                                {
                                    text: formValues.programa,
                                    style: 'infoValue',
                                    colSpan: 3,
                                    valign: 'bottom',
                                },
                                {},
                                {},
                            ],
                            [
                                {
                                    text: 'Nombre del Estudiante:',
                                    style: 'infoLabel',
                                    valign: 'bottom',
                                },
                                {
                                    text: formValues.nombreEstudiante,
                                    style: 'infoValue',
                                    colSpan: 3,
                                    valign: 'bottom',
                                },
                                {},
                                {},
                            ],
                            [
                                {
                                    text: 'Cédula de Ciudadanía:',
                                    style: 'infoLabel',
                                    valign: 'bottom',
                                },
                                {
                                    text: formValues.cedulaCiudadania,
                                    style: 'infoValue',
                                    valign: 'bottom',
                                },
                                {
                                    text: 'Lugar de Expedición:',
                                    style: 'infoLabel',
                                    alignment: 'left',
                                    valign: 'bottom',
                                },
                                {
                                    text: formValues.lugarExpedicion,
                                    style: 'infoValue',
                                    valign: 'bottom',
                                },
                            ],
                            [
                                {
                                    text: 'Código:',
                                    style: 'infoLabel',
                                    valign: 'bottom',
                                },
                                {
                                    text: formValues.codigo,
                                    style: 'infoValue',
                                    colSpan: 3,
                                    valign: 'bottom',
                                },
                                {},
                                {},
                            ],
                            [
                                {
                                    text: 'Teléfono Fijo:',
                                    style: 'infoLabel',
                                    valign: 'bottom',
                                },
                                {
                                    text: formValues.telefonoFijo,
                                    style: 'infoValue',
                                    valign: 'bottom',
                                },
                                {
                                    text: 'Teléfono Celular:',
                                    style: 'infoLabel',
                                    alignment: 'left',
                                    valign: 'bottom',
                                },
                                {
                                    text: formValues.telefonoCelular,
                                    style: 'infoValue',
                                    valign: 'bottom',
                                },
                            ],
                            [
                                {
                                    text: 'Código Pruebas SABER PRO:',
                                    style: 'infoLabel',
                                    valign: 'bottom',
                                },
                                {
                                    text: formValues.codigoSaberPro,
                                    style: 'infoValue',
                                    colSpan: 3,
                                    valign: 'bottom',
                                },
                                {},
                                {},
                            ],
                            [
                                {
                                    text: 'Residencia Actual:',
                                    style: 'infoLabel',
                                    valign: 'bottom',
                                },
                                {
                                    text: formValues.residenciaActual,
                                    style: 'infoValue',
                                    valign: 'bottom',
                                },
                                {
                                    text: 'Departamento:',
                                    style: 'infoLabel',
                                    alignment: 'left',
                                    valign: 'bottom',
                                },
                                {
                                    text: formValues.departamento,
                                    style: 'infoValue',
                                    valign: 'bottom',
                                },
                            ],
                            [
                                {
                                    text: 'Municipio:',
                                    style: 'infoLabel',
                                    valign: 'bottom',
                                },
                                {
                                    text: formValues.municipio,
                                    style: 'infoValue',
                                    valign: 'bottom',
                                },
                                {
                                    text: 'Email:',
                                    style: 'infoLabel',
                                    alignment: 'left',
                                    valign: 'bottom',
                                },
                                {
                                    text: formValues.email,
                                    style: 'infoValue',
                                    valign: 'bottom',
                                },
                            ],
                        ],
                    },
                    margin: [0, 5, 0, 5],
                },
                {
                    image: this.firmaEstudiante,
                    width: 80,
                    height: 60,
                    margin: [0, 5, 0, 0],
                    alignment: 'center',
                },
                {
                    canvas: [
                        {
                            type: 'line',
                            x1: 0,
                            y1: 0,
                            x2: 500,
                            y2: 0,
                            lineWidth: 1,
                        },
                    ],
                },
                {
                    text: 'Firma Estudiante',
                    style: 'firmaLabel',
                    margin: [0, 5, 0, 0],
                },
                {
                    table: {
                        widths: ['auto', '*', 'auto', '*', 'auto', '*'],
                        body: [
                            [
                                {
                                    text: 'Día',
                                    style: 'infoDesc',
                                    alignment: 'left',
                                    valign: 'bottom',
                                },
                                {
                                    text: formValues.dia,
                                    style: 'infoValue',
                                    alignment: 'left',
                                    valign: 'bottom',
                                },
                                {
                                    text: 'Mes',
                                    style: 'infoDesc',
                                    alignment: 'left',
                                    valign: 'bottom',
                                },
                                {
                                    text: formValues.mes,
                                    style: 'infoValue',
                                    alignment: 'left',
                                    valign: 'bottom',
                                },
                                {
                                    text: 'Año',
                                    style: 'infoDesc',
                                    alignment: 'left',
                                    valign: 'bottom',
                                },
                                {
                                    text: formValues.anio,
                                    style: 'infoValue',
                                    alignment: 'left',
                                    valign: 'bottom',
                                },
                            ],
                        ],
                    },
                    margin: [0, 10, 0, 0],
                },
                {
                    text: 'Diligenciamiento exclusivo por la Facultad',
                    style: 'header',
                    alignment: 'center',
                    margin: [0, 5, 0, 0],
                },
                {
                    text: [
                        {
                            text: 'El Coordinador del programa de: ',
                            bold: true,
                        },
                        {
                            text: formValues.programa,
                            decoration: 'underline',
                        },
                        `\nEstudio la petición hecha por el alumno (a): ${formValues.nombreEstudiante} \n`,
                        'y certifica que ha aprobado todas las asignaturas y requisitos académicos y los que establece la Universidad para optar al título de: ',
                        {
                            text: formValues.titulo,
                            decoration: 'underline',
                        },
                        '\nEn consecuencia recomienda continuar con los trámites de expedición de Paz y Salvo General para su graduación.\n',
                        'Nombre Coordinador Programa: ',
                        {
                            text: formValues.nombreCoordinador,
                            decoration: 'underline',
                        },
                    ],
                    margin: [0, 5, 0, 0],
                },
                {
                    image: this.firmaCoordinador,
                    width: 80,
                    height: 60,
                    margin: [0, 5, 0, 0],
                    alignment: 'center',
                },
                {
                    canvas: [
                        {
                            type: 'line',
                            x1: 0,
                            y1: 0,
                            x2: 500,
                            y2: 0,
                            lineWidth: 1,
                        },
                    ],
                },
                {
                    text: 'Firma',
                    style: 'firmaLabel',
                    margin: [0, 5, 0, 10],
                },
            ],
            styles: {
                header: {
                    fontSize: 14,
                    bold: true,
                    margin: [0, 0, 0, 5],
                    alignment: 'center',
                },
                infoDesc: {
                    fontSize: 10,
                    margin: [0, 2, 0, 2],
                    alignment: 'center',
                },
                infoLabel: {
                    bold: true,
                    margin: [0, 2, 0, 2],
                    alignment: 'left',
                },
                infoValue: {
                    margin: [0, 2, 0, 2],
                    alignment: 'left',
                },
                firmaLabel: {
                    bold: true,
                    margin: [0, 5, 0, 0],
                    alignment: 'center',
                },
            },
        };
    }

    getFormControl(formControlName: string): FormControl {
        return this.formatoHvaForm.get(formControlName) as FormControl;
    }

    onFirmaChange(event: any, fieldName: string) {
        const input = event && event.files ? event : { files: [] };
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (fieldName === 'firmaEstudiante') {
                    this.firmaEstudiante = reader.result as string;
                } else if (fieldName === 'firmaCoordinador') {
                    this.firmaCoordinador = reader.result as string;
                }
            };
            reader.readAsDataURL(file);
            const patchObject = {};
            patchObject[fieldName] = file;
            this.formatoHvaForm.patchValue(patchObject);
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
