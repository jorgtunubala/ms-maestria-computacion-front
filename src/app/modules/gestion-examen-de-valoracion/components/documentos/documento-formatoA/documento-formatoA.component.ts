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
import { MessageService, SelectItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Mensaje, Rol, TipoRol } from 'src/app/core/enums/enums';
import { mapResponseException } from 'src/app/core/utils/exception-util';
import {
    errorMessage,
    infoMessage,
    warnMessage,
} from 'src/app/core/utils/message-util';
import { enumToSelectItems } from 'src/app/core/utils/util';
import { BuscadorDocentesComponent } from 'src/app/shared/components/buscador-docentes/buscador-docentes.component';
import { BuscadorExpertosComponent } from 'src/app/shared/components/buscador-expertos/buscador-expertos.component';
import { Estudiante } from 'src/app/modules/gestion-estudiantes/models/estudiante';
import { Orientador } from '../../../models/orientador';
import { TrabajoDeGradoService } from '../../../services/trabajoDeGrado.service';
import { Subscription, firstValueFrom } from 'rxjs';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: 'documento-formatoA',
    templateUrl: 'documento-formatoA.component.html',
    styleUrls: ['documento-formatoA.component.scss'],
})
export class DocumentoFormatoAComponent implements OnInit {
    @Output() formReady = new EventEmitter<FormGroup>();
    @Output() formatoAPdfGenerated = new EventEmitter<File>();
    @ViewChild('formatoA') formatoA!: ElementRef;

    formatoAForm: FormGroup;

    private estudianteSubscription: Subscription;
    private tituloSubscription: Subscription;
    private evaluadorInternoSubscription: Subscription;
    private evaluadorExternoSubscription: Subscription;

    loading = false;

    tipoSeleccionado = '';
    rolSeleccionado = '';

    fechaActual: Date;
    firmaTutor: string | ArrayBuffer;
    logoImage: string;
    footerImage: string;

    estudianteSeleccionado: Estudiante = {};
    orientadores: Orientador[] = [];
    roles: SelectItem[] = enumToSelectItems(Rol);
    tipos: SelectItem[] = enumToSelectItems(TipoRol);

    constructor(
        private fb: FormBuilder,
        private dialogService: DialogService,
        private messageService: MessageService,
        private trabajoDeGradoService: TrabajoDeGradoService
    ) {}

    get titulo(): FormControl {
        return this.formatoAForm.get('titulo') as FormControl;
    }

    get estudiante(): FormControl {
        return this.formatoAForm.get('estudiante') as FormControl;
    }

    get experto(): FormControl {
        return this.formatoAForm.get('evaluadorExterno') as FormControl;
    }

    get orientador(): FormControl {
        return this.formatoAForm.get('orientador') as FormControl;
    }

    get docente(): FormControl {
        return this.formatoAForm.get('evaluadorInterno') as FormControl;
    }

    get tipo(): FormControl {
        return this.formatoAForm.get('tipo') as FormControl;
    }

    get rol(): FormControl {
        return this.formatoAForm.get('rol') as FormControl;
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

        this.tipo.valueChanges.subscribe(
            (response) => (this.tipoSeleccionado = response)
        );
        this.rol.valueChanges.subscribe(
            (response) => (this.rolSeleccionado = response)
        );
    }

    initForm(): void {
        this.formatoAForm = this.fb.group({
            asunto: [
                'SOLICITUD PARA PRESENTACIÓN DE EXAMEN DE VALORACIÓN AL COMITÉ DE PROGRAMA DE MAESTRÍA EN COMPUTACIÓN',
                Validators.required,
            ],
            titulo: [null, Validators.required],
            estudiante: [null, Validators.required],
            orientador: [null, Validators.required],
            rol: [null, Validators.required],
            tipo: [null, Validators.required],
            evaluadorInterno: [null, Validators.required],
            evaluadorExterno: [null, Validators.required],
            firmaTutor: [null, Validators.required],
        });

        this.formReady.emit(this.formatoAForm);

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
        if (this.evaluadorExternoSubscription) {
            this.evaluadorExternoSubscription.unsubscribe();
        }
        if (this.evaluadorInternoSubscription) {
            this.evaluadorInternoSubscription.unsubscribe();
        }
    }

    generateDocDefinition() {
        const formValues = this.formatoAForm.value;
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
                    text: 'SOLICITUD EXAMEN DE VALORACIÓN',
                    style: 'header',
                    alignment: 'center',
                },
                {
                    text: `Popayán, ${fechaActual}`,
                    style: 'subheader',
                    alignment: 'center',
                },
                {
                    columns: [
                        { text: 'FORMATO A:', style: 'label', width: '25%' },
                        {
                            text: formValues.asunto,
                            style: 'value',
                            width: '75%',
                        },
                    ],
                    margin: [0, 10, 0, 10],
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
                    margin: [0, 10, 0, 10],
                },
                {
                    columns: [
                        {
                            text: 'TUTORES Y ASESORES',
                            style: 'label',
                            width: '20%',
                        },
                        {
                            stack: [
                                ...this.orientadores.map((orientador) => ({
                                    text: `${orientador.nombre} ${
                                        orientador.apellido
                                    } (${this.formatText(orientador.rol)})`,
                                    margin: [25, 10, 0, 0],
                                })),
                            ],
                            width: '70%',
                        },
                    ],
                    margin: [0, 10, 0, 10],
                },
                {
                    columns: [
                        {
                            text: 'EVALUADORES SUGERIDOS:',
                            style: 'label',
                            width: '25%',
                        },
                        {
                            stack: [
                                {
                                    text: `${this.docente.value.nombres}, ${this.docente.value.universidad}, ${this.docente.value.correo} (Interno)`,
                                    style: 'value',
                                },
                                {
                                    text: `${this.experto.value.nombres}, ${this.experto.value.universidad}, ${this.experto.value.correo} (Externo)`,
                                    style: 'value',
                                },
                            ],
                            width: '70%',
                        },
                    ],
                    margin: [0, 10, 0, 10],
                },
                {
                    columns: [
                        { text: 'FIRMA:', style: 'label', width: '25%' },
                        {
                            image: this.firmaTutor,
                            width: 80,
                            height: 60,
                            margin: [0, 5, 0, 0],
                            alignment: 'left',
                            style: 'value',
                        },
                    ],
                    margin: [0, 10, 0, 10],
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

    onInsertar() {
        if (this.formatoAForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            const docDefinition = this.generateDocDefinition();
            pdfMake.createPdf(docDefinition).getBlob((pdfBlob: Blob) => {
                const file = new File(
                    [pdfBlob],
                    `${this.estudianteSeleccionado.codigo} - formatoA.pdf`,
                    {
                        type: 'application/pdf',
                    }
                );
                this.formatoAPdfGenerated.emit(file);
                this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
            });
        }
    }

    onDownload() {
        if (this.formatoAForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            const docDefinition = this.generateDocDefinition();
            pdfMake.createPdf(docDefinition).getBlob((pdfBlob: Blob) => {
                const file = new File(
                    [pdfBlob],
                    `${this.estudianteSeleccionado.codigo} - formatoA.pdf`,
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

    getFormControl(formControlName: string): FormControl {
        return this.formatoAForm.get(formControlName) as FormControl;
    }

    formatText(text: string): string {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

    onFirmaChange(event: any, fieldName: string) {
        const input = event && event.files ? event : { files: [] };
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (fieldName === 'firmaTutor') {
                    this.firmaTutor = reader.result as string;
                }
            };
            reader.readAsDataURL(file);
            const patchObject = {};
            patchObject[fieldName] = file;
            this.formatoAForm.patchValue(patchObject);
        }
    }

    showBuscadorExpertos() {
        return this.dialogService.open(BuscadorExpertosComponent, {
            header: 'Seleccionar experto',
            width: '60%',
        });
    }

    mapOrientadorLabel(orientador: any) {
        return {
            id: orientador.id,
            nombre: orientador.nombre,
            apellido: orientador.apellido,
            correo: orientador.correo ?? orientador.correoElectronico,
            rol: this.rolSeleccionado,
            tipo: this.tipoSeleccionado,
        };
    }

    showBuscadorDocentes() {
        return this.dialogService.open(BuscadorDocentesComponent, {
            header: 'Seleccionar docente',
            width: '60%',
        });
    }
    nombreCompletoEstudiante(e: any) {
        return `${e.nombre} ${e.apellido}`;
    }

    async onSeleccionarOrientador(tipo: string): Promise<void> {
        try {
            const ref =
                tipo === 'INTERNO'
                    ? this.showBuscadorDocentes()
                    : this.showBuscadorExpertos();

            const response = await firstValueFrom(ref.onClose);
            if (response) {
                const orientador = this.mapOrientadorLabel(response);
                if (this.orientadores.some((o) => o.id === orientador.id)) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail: 'Este orientador ya está seleccionado.',
                    });
                    return;
                }
                this.orientador.setValue(orientador);
                this.orientadores.push(orientador);
            }
        } catch (error) {
            console.error('Error al seleccionar orientador:', error);
        }
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

    limpiarOrientador(index: number) {
        this.orientador.setValue(null);
        this.orientadores.splice(index, 1);
    }
}
