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
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import * as PizZip from 'pizzip';
import * as Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import * as JSZipUtils from 'pizzip/utils/index.js';
import { Mensaje } from 'src/app/core/enums/enums';
import { mapResponseException } from 'src/app/core/utils/exception-util';
import {
    errorMessage,
    infoMessage,
    warnMessage,
} from 'src/app/core/utils/message-util';
import { TrabajoDeGradoService } from '../../../services/trabajoDeGrado.service';
import { FileUpload } from 'primeng/fileupload';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: 'documento-formatoG',
    templateUrl: 'documento-formatoG.component.html',
    styleUrls: ['documento-formatoG.component.scss'],
})
export class DocumentoFormatoGComponent implements OnInit {
    @Input() juradoInterno: any;
    @Input() juradoExterno: any;
    @Output() formReady = new EventEmitter<FormGroup>();
    @Output() formatoGPdfGenerated = new EventEmitter<File>();
    @ViewChild('formatoG') formatoG!: ElementRef;
    @ViewChild('FormatoG') FormatoG!: FileUpload;

    estudianteSubscription: Subscription;
    tituloSubscription: Subscription;

    formatoGForm: FormGroup;

    isPending = true;
    loading = false;

    estudianteSeleccionado: any;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private messageService: MessageService,
        private trabajoDeGradoService: TrabajoDeGradoService
    ) {}

    get estudiante(): FormControl {
        return this.formatoGForm.get('estudiante') as FormControl;
    }

    get titulo(): FormControl {
        return this.formatoGForm.get('titulo') as FormControl;
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
    }

    initForm(): void {
        const today = new Date();
        const dia = today.getDate();
        const mes = today.getMonth() + 1;
        const anio = today.getFullYear();

        const fecha = `${dia} de ${mes} de ${anio}`;

        this.formatoGForm = this.fb.group({
            fecha: [fecha, Validators.required],
            facultad: [
                'Ingeniería Electrónica y Telecomunicaciones',
                Validators.required,
            ],
            programa: ['Maestría en Computación', Validators.required],
            estudiante: [null, Validators.required],
            titulo: [null, Validators.required],
            juradoInterno: [
                this.juradoInterno.nombres + ', ' + this.juradoInterno.correo,
                Validators.required,
            ],
            juradoExterno: [
                this.juradoExterno.nombres + ', ' + this.juradoExterno.correo,
                Validators.required,
            ],
            coordinador: ['Luz Marina Sierra', Validators.required],
        });
        this.formReady.emit(this.formatoGForm);
    }

    ngOnDestroy() {
        if (this.estudianteSubscription) {
            this.estudianteSubscription.unsubscribe();
        }
        if (this.tituloSubscription) {
            this.tituloSubscription.unsubscribe();
        }
    }

    onCancel() {
        this.router.navigate(['examen-de-valoracion/solicitud']);
    }

    onDownload() {
        this.isPending = false;
        if (this.formatoGForm.invalid) {
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            this.loading = true;
            const formValues = this.formatoGForm.value;

            const docData: any = {
                fecha: formValues.fecha,
                facultad: formValues.facultad,
                programa: formValues.programa,
                estudiante: formValues.estudiante,
                titulo: formValues.titulo,
                juradoInterno: formValues.juradoInterno,
                juradoExterno: formValues.juradoExterno,
                coordinador: formValues.coordinador,
            };

            this.loadFile(
                'assets/plantillas/formatoG.docx',
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

                    saveAs(out, 'formatoG.docx');
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
        if (this.formatoGForm.invalid) {
            this.FormatoG.clear();
            this.handleWarningMessage(Mensaje.REGISTRE_CAMPOS_OBLIGATORIOS);
            return;
        } else {
            this.loading = true;
            const file: File = event.files[0];
            if (file) {
                this.formatoGPdfGenerated.emit(file);
                this.handleSuccessMessage(Mensaje.GUARDADO_EXITOSO);
            }
            this.loading = false;
            this.FormatoG.clear();
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
