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
    FormArray,
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
    selector: 'documento-formatoC',
    templateUrl: 'documento-formatoC.component.html',
    styleUrls: ['documento-formatoC.component.scss'],
})
export class DocumentoFormatoCComponent implements OnInit {
    @Input() formatoCEv1: File;
    @Input() formatoCEv2: File;
    @Input() evaluador: Evaluador;
    @Output() formReady = new EventEmitter<FormGroup>();
    @Output() formatoCPdfGenerated = new EventEmitter<File>();

    @ViewChild('formatoC') formatoC!: ElementRef;
    @ViewChild('FormatoC') FormatoC!: FileUpload;

    private estudianteSubscription: Subscription;
    private tituloSubscription: Subscription;

    formatoCForm: FormGroup;

    loading = false;
    isPending = true;

    fechaActual: Date;
    estudianteSeleccionado: Estudiante = {};

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private trabajoDeGradoService: TrabajoDeGradoService
    ) {}

    get titulo(): FormControl {
        return this.formatoCForm.get('titulo') as FormControl;
    }

    get observaciones(): FormArray {
        return this.formatoCForm.get('observaciones') as FormArray;
    }

    get recomendaciones(): FormArray {
        return this.formatoCForm.get('recomendaciones') as FormArray;
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
                    }
                },
                error: (e) => this.handlerResponseException(e),
            });
    }

    initForm(): void {
        this.formatoCForm = this.fb.group({
            receptor: ['Luz Marina Sierra Martínez', Validators.required],
            asunto: ['Examen de Valoración', Validators.required],
            titulo: [null, Validators.required],
            observaciones: [null, Validators.required],
        });
        this.formatoCForm.get('observaciones').disable();
        this.formReady.emit(this.formatoCForm);
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
        if (this.formatoCForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            this.loading = true;
            const formValues = this.formatoCForm.value;

            const docData: any = {
                fecha: this.getFormattedDate(),
                titulo: formValues.titulo,
                asunto: formValues.asunto,
                receptor: formValues.receptor,
                jurado:
                    this.evaluador.nombres + ', ' + this.evaluador.universidad,
            };

            this.loadFile(
                'assets/plantillas/formatoC.docx',
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

                    saveAs(out, 'formatoC.docx');
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
        if (this.formatoCForm.invalid) {
            this.FormatoC.clear();
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            this.loading = true;
            const file: File = event.files[0];
            if (file) {
                this.formatoCPdfGenerated.emit(file);
                this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
            }
            this.loading = false;
            this.FormatoC.clear();
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
}
