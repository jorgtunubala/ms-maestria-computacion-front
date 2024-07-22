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
import * as PizZip from 'pizzip';
import * as Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import * as JSZipUtils from 'pizzip/utils/index.js';
import { Estudiante } from 'src/app/modules/gestion-estudiantes/models/estudiante';
import { TrabajoDeGradoService } from '../../../services/trabajoDeGrado.service';
import { Mensaje } from 'src/app/core/enums/enums';
import { mapResponseException } from 'src/app/core/utils/exception-util';
import {
    errorMessage,
    infoMessage,
    warnMessage,
} from 'src/app/core/utils/message-util';
import { FileUpload } from 'primeng/fileupload';

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
    @Input() formatoBEv1: File;
    @Input() formatoBEv2: File;
    @Input() evaluador: Evaluador;
    @Output() formReady = new EventEmitter<FormGroup>();
    @Output() formatoBPdfGenerated = new EventEmitter<File>();

    @ViewChild('formatoB') formatoB!: ElementRef;
    @ViewChild('FormatoB') FormatoB!: FileUpload;

    private estudianteSubscription: Subscription;
    private tituloSubscription: Subscription;

    formatoBForm: FormGroup;
    fechaActual: Date;

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

        this.formatoBForm.get('fecha').setValue(this.fechaActual);
    }

    initForm(): void {
        this.formatoBForm = this.fb.group({
            fecha: [null, Validators.required],
            titulo: [null, Validators.required],
            estudiante: [null, Validators.required],
            conceptoJurado: [null, Validators.required],
        });
        this.formatoBForm.get('fecha').disable();
        this.formatoBForm.get('conceptoJurado').disable();
        this.formReady.emit(this.formatoBForm);
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

    onAdjuntar(event: any) {
        if (this.formatoBForm.invalid) {
            this.FormatoB.clear();
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            this.loading = true;
            const file: File = event.files[0];
            if (file) {
                this.formatoBPdfGenerated.emit(file);
                this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
            }
            this.loading = false;
            this.FormatoB.clear();
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
